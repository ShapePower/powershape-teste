import { useEffect, useMemo, useState } from "react";
import { FiImage, FiArrowLeft, FiClock } from "react-icons/fi";
import StateHandler from "../components/StateHandler.jsx";
import useStore from "../lib/store.js";
import Button from "../components/Button.jsx";
import computeWorkoutData from "../lib/computeWorkoutData.js";
import Textarea from "../components/Textarea.jsx";
import Input from "../components/Input.jsx";
import ExercisePane from "../components/ExercisePane.jsx";
import ExerciseFooter from "../components/ExerciseFooter.jsx";
import clsx from "clsx";

let interval;

const formatTime = (time) => {
  const hours = Math.floor(time / 3600);
  const minutes = Math.floor((time % 3600) / 60);
  const seconds = time % 60;

  let formattedTime = "";
  if (hours > 0) formattedTime += `${hours}h `;
  if (minutes > 0 || hours > 0) formattedTime += `${minutes}min `;
  if (seconds > 0 || (hours === 0 && minutes === 0)) formattedTime += `${seconds}s`;

  return formattedTime.trim();
};

const getStorageKey = (workoutId, userId) => `workout_progress_${workoutId}_${userId}`;

const WorkoutRunScreen = ({ history }) => {
  const [result, setResult] = useState(null);
  const [feedbackText, setFeedbackText] = useState("");
  const [totalDuration, setTotalDuration] = useState(0);
  const [activeWorkoutIndex, setActiveWorkoutIndex] = useState(0);
  const currentUser = useStore((state) => state.currentUser);
  const weightHistory = useStore((state) => state.currentUser?.weightHistory);
  const exercises = useStore((state) => state.exercises);
  const isLoading = useStore((state) => state.isLoading);
  const displayTime = useStore((state) => state.displayTime);
  const setShowTimer = useStore((state) => state.setShowTimer);
  const setTimerTime = useStore((state) => state.setTimerTime);
  const store = useStore();
  const [hasErrors, setHasErrors] = useState(null);
  const [nextStep, setNextStep] = useState(null);
  const [isFlashing, setIsFlashing] = useState(false);
  const [previousIndex, setPreviousIndex] = useState(null);

  const workoutId = history?.location?.pathname?.split("/")[2];
  const index = new URLSearchParams(history?.location?.search).get("index");

  const { workoutData, currentWeek } = useMemo(() => computeWorkoutData(currentUser, exercises, weightHistory), [currentUser, exercises, weightHistory]);
  const workout = workoutData?.find((n) => n?.workoutId === workoutId);

  const totalSeries = workout?.exercises?.reduce((acc, curr) => acc + curr?.sets?.length, 0);
  const finishedSeries = result?.reduce((acc, curr) => acc + curr?.sets?.filter((set) => set?.done)?.length, 0);

  const handleReturn = () => {
    if (!nextStep) {
      history.push("/home");
    } else {
      setHasErrors(null);
      setNextStep(false);
      clearInterval(interval);
      interval = setInterval(() => {
        setTotalDuration((prev) => prev + 1);
      }, 1000);
    }
  };

  const handleTimer = (restTime) => {
    setShowTimer(true);
    if (typeof restTime === "number") {
      setTimerTime(restTime);
    }
  };

  const handleTopTimer = () => {
    setShowTimer(true);
    if (displayTime !== "00:00" || !displayTime) {
      setTimerTime(0);
    }
  };

  const uploadFiles = async () => {
    const formData = new FormData();
    const files = document.querySelector('input[type="file"]').files;
    for (const file of files) {
      formData.append("files", file);
    }

    return await store.uploadFiles(formData);
  };

  const saveToLocalStorage = (workoutResult) => {
    if (!workoutId || !currentUser?._id) return;

    const storageData = {
      result: workoutResult,
      timestamp: Date.now(),
      totalDuration: totalDuration,
    };

    localStorage.setItem(getStorageKey(workoutId, currentUser._id), JSON.stringify(storageData));
  };

  const saveWorkout = async () => {
    const data = await uploadFiles();
    const files = data.data.files;

    const modifiedWorkout = JSON.parse(JSON.stringify(workout));
    modifiedWorkout.day = new Date().toISOString();
    modifiedWorkout.result = result;
    modifiedWorkout.feedbackText = feedbackText;
    modifiedWorkout.feedbackData = files;
    modifiedWorkout.duration = totalDuration;

    currentWeek.workouts[index] = modifiedWorkout;

    await Promise.all([store.saveWeek(currentWeek._id, currentWeek), store.pushWeightHistory({ workout: result })]);

    localStorage.removeItem(getStorageKey(workoutId, currentUser._id));
    history.push("/home");
    store.getCurrentUser();
  };

  const handleFinish = () => {
    const updatedResult = result?.map((exercise) => ({
      ...exercise, //
      sets: exercise?.sets?.map((set) => ({
        ...set,
        error: ("time" in set ? !set?.time : !set?.reps) || !set?.weight,
      })),
    }));

    const hasErrorsResult = updatedResult?.some((exercise) => exercise?.sets?.some((set) => set?.error));
    if (hasErrors !== null) {
      setNextStep(true);
      clearInterval(interval);
    }
    setHasErrors(hasErrorsResult);
    setResult(updatedResult);
  };

  const handleDiscard = () => {
    history.push("/home");
  };

  const handleNext = () => {
    const currentExercise = result?.[activeWorkoutIndex];
    const unfinishedSets = currentExercise?.sets?.filter((set) => !set.done);

    if (unfinishedSets.length > 0) {
      const firstUnfinishedSetIndex = currentExercise.sets.findIndex((set) => !set.done);
      handleSetDone(firstUnfinishedSetIndex);
    } else {
      setActiveWorkoutIndex(activeWorkoutIndex + 1);
    }
  };

  const handleSetDone = (index) => {
    const newResult = [...result];
    const currentExercise = { ...newResult[activeWorkoutIndex] };
    const newSets = [...currentExercise.sets];

    const lastWeight = currentExercise?.lastWeight;
    const lastReps = currentExercise?.lastReps;

    newSets[index] = {
      ...newSets[index],
      done: true,
      weight: newSets[index].weight || lastWeight,
      reps: newSets[index].reps || lastReps,
    };

    currentExercise.sets = newSets;
    newResult[activeWorkoutIndex] = currentExercise;

    setResult(newResult);
    handleTimer(newSets[index].rest);
  };

  useEffect(() => {
    if (workout?.exercises?.length > 0 && !isLoading && currentUser && !result) {
      const storageKey = getStorageKey(workoutId, currentUser._id);
      const savedData = localStorage.getItem(storageKey);

      if (savedData) {
        const parsed = JSON.parse(savedData);
        const hourAgo = Date.now() - 60 * 60 * 1000;

        if (parsed.timestamp > hourAgo) {
          setResult(parsed.result);
          setTotalDuration(parsed.totalDuration);
          setActiveWorkoutIndex(0);
          return;
        } else {
          localStorage.removeItem(storageKey);
        }
      }

      const initialResult = workout?.exercises?.map((exercise) => ({
        ...exercise,
        sets: exercise?.sets?.map((set) => ({
          ...set,
          id: set?.id,
          _id: set?._id,
          setType: set?.setType,
          expectedWeight: set?.weight,
          ...("time" in set ? { expectedTime: set?.time, time: 0 } : { expectedReps: set?.reps, reps: 0 }),
          weight: 0,
          done: false,
        })),
      }));

      setResult(initialResult);
      setActiveWorkoutIndex(0);
      saveToLocalStorage(initialResult);
    }
  }, [workout, isLoading, currentUser, workoutId]);

  useEffect(() => {
    if (result) {
      saveToLocalStorage(result);
    }
  }, [JSON.stringify(result), workoutId, currentUser?._id]);

  useEffect(() => {
    interval = setInterval(() => {
      setTotalDuration((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (previousIndex !== activeWorkoutIndex) {
      setIsFlashing(true);
      const timer = setTimeout(() => {
        setIsFlashing(false);
      }, 500);
      setPreviousIndex(activeWorkoutIndex);
      return () => clearTimeout(timer);
    }
  }, [activeWorkoutIndex]);

  return (
    <main className={clsx("run", isFlashing && "flash")}>
      <header className="run-header">
        <Button className="icon" onClick={handleReturn}>
          <FiArrowLeft />
        </Button>
        <div className="run-header-right">
          {!nextStep && (
            <Button className="icon" onClick={handleTopTimer}>
              {!!displayTime && displayTime !== "00:00" && <span style={{ marginRight: 5 }}>{displayTime}</span>}
              <FiClock />
            </Button>
          )}
          {finishedSeries === totalSeries && (
            <Button className="sm" onClick={nextStep ? saveWorkout : handleFinish}>
              {nextStep ? "Salvar" : "Concluir"}
            </Button>
          )}
        </div>
      </header>
      <div className="run-info">
        <div>
          <p>Duração</p>
          <span>{formatTime(totalDuration)}</span>
        </div>
        <div>
          <p>Séries</p>
          <span>
            {finishedSeries || 0}/{totalSeries}
          </span>
        </div>
      </div>
      {hasErrors && !nextStep && (
        <p className="error" style={{ margin: "10px 20px" }}>
          Complete as séries em vermelho ou salve o treino incompleto.
        </p>
      )}
      {!nextStep && (
        <>
          <ExercisePane exercise={result?.[activeWorkoutIndex]} activeIndex={activeWorkoutIndex} triggerTimer={handleTimer} onSetDone={handleSetDone} />
          <ExerciseFooter exercises={result} activeIndex={activeWorkoutIndex} setActiveIndex={setActiveWorkoutIndex} onNext={handleNext} />
        </>
      )}
      {nextStep && (
        <div className="next-step">
          <div className="add-photos">
            <div className="img-wrapper">
              <FiImage />
            </div>
            <Input name="files" type="file" multiple accept="image/*,video/*" maxSize={50 * 1024 * 1024} label="Adicionar fotos ou vídeos" />
          </div>
          <Textarea value={feedbackText} onChange={(e) => setFeedbackText(e.target.value)} label="Comentários" placeholder="Como foi o seu treino?" />
          <Button className="text error" onClick={handleDiscard}>
            Descartar treino
          </Button>
        </div>
      )}
      <StateHandler />
    </main>
  );
};

export default WorkoutRunScreen;
