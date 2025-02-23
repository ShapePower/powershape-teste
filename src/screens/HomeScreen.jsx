import { useEffect, useMemo, useState } from "react";
import { FiCheck, FiMinus, FiPlay, FiRepeat } from "react-icons/fi";
import { BsYoutube } from "react-icons/bs";
import { Dropdown, Pagination } from "antd";
import Avatar from "../components/Avatar.jsx";
import Button from "../components/Button.jsx";
import Wrapper from "../components/Wrapper.jsx";
import useStore from "../lib/store.js";
import computeWorkoutData from "../lib/computeWorkoutData.js";
import getNextWorkoutIndex from "../lib/getNextWorkoutIndex.js";
import clsx from "clsx";

const HomeScreen = ({ history }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const store = useStore();
  const currentUser = useStore((state) => state.currentUser);
  const weightHistory = useStore((state) => state.currentUser?.weightHistory);
  const exercises = useStore((state) => state.exercises);
  const weekTypes = useStore((state) => state.weekTypes);
  const firstName = currentUser?.name?.split(" ")[0];

  const { workoutData, currentWeek, currentWeekIndex, allWeeks } = useMemo(() => computeWorkoutData(currentUser, exercises, weightHistory), [currentUser, exercises, weightHistory]);
  const nextWorkoutIndex = getNextWorkoutIndex(workoutData);

  const weekType = weekTypes?.find((t) => t._id === currentWeek?.type)?.name || "Base";

  const workoutItems = workoutData //
    ?.filter((w) => !!w.workoutId)
    ?.map((w, idx) => ({ label: w.name, key: `${w.workoutId}-${idx}` }));

  const handleRun = (workout, idx) => {
    const computedWorkoutId = workout?.modifiedWorkoutId ?? workout?.workoutId;
    history.push(`/workout/${computedWorkoutId}?index=${idx}`);
  };

  const handleModify = async ({ key }, index) => {
    const finalKey = key.split("-")[0];
    const workouts = JSON.parse(JSON.stringify(currentWeek.workouts));

    if (workouts[index].workoutId === finalKey) {
      workouts[index].modifiedWorkoutId = undefined;
    } else {
      workouts[index].modifiedWorkoutId = finalKey;
    }

    await store.saveWeek(currentWeek._id, { workouts });
    await store.getCurrentUser();
  };

  const isNextWorkout = (workout) => {
    return currentWeekIndex === currentPage && nextWorkoutIndex === allWeeks[currentPage]?.workouts?.indexOf(workout);
  };

  useEffect(() => {
    setCurrentPage(currentWeekIndex);
  }, [currentWeekIndex]);

  return (
    <Wrapper className="home" history={history}>
      <div className="home-container">
        <header className="home-header">
          <Avatar name={currentUser?.name} className="inverted" />
          <h2>Olá, {firstName}!</h2>
        </header>

        <div className="home-workouts">
          <div className="home-workouts-header">
            <p className="home-workouts-title">
              Treinos da Semana{" "}
              <span className="grey">
                ({currentPage + 1}/{allWeeks?.length})
              </span>
            </p>
            <div className="home-workouts-header-right">
              <p className="home-workout-week-type">{weekType}</p>
              <BsYoutube />
            </div>
          </div>
          {allWeeks[currentPage]?.length === 0 && <p className="home-workouts-empty">Nenhum treino cadastrado!</p>}
          {allWeeks?.[currentPage]?.workouts?.map((workout, idx) => (
            <div className={clsx("home-workout", workout?.result?.length > 0 && "finished", isNextWorkout(workout) && "next")} key={`${workout._id}-${idx}`}>
              <div className="home-workout-left">
                <h3 className={workout?.modifiedWorkoutId && workout?.modifiedWorkoutId !== workout?.workoutId ? "modified" : ""}>
                  {workout?.modifiedWorkoutId ? workout?.modifiedName : workout?.workoutId ? workout.name : "Descanso"}
                </h3>
                {workout?.workoutId && <p>{workout?.modifiedWorkoutId ? "Treino modificado" : workout.description}</p>}
              </div>
              <div className="home-workout-right">
                {workout?.result?.length > 0 && workout?.workoutId && (
                  <Button className="icon sm">
                    <FiCheck />
                  </Button>
                )}
                {!workout?.workoutId && workout?.result?.length === 0 && (
                  <Button className="icon sm" disabled={true}>
                    <FiMinus />
                  </Button>
                )}
                {workout?.workoutId && workout?.result?.length === 0 && (
                  <>
                    <Button className="icon sm" onClick={() => handleRun(workout, idx)} disabled={false}>
                      <FiPlay />
                    </Button>
                    <Dropdown menu={{ items: workoutItems, onClick: (e) => handleModify(e, idx) }}>
                      <Button className="icon sm">
                        <FiRepeat />
                      </Button>
                    </Dropdown>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
        <Pagination style={{ margin: "10px 0" }} align="center" current={currentPage + 1} pageSize={1} total={allWeeks?.length} onChange={(page) => setCurrentPage(page - 1)} />
      </div>
    </Wrapper>
  );
};

export default HomeScreen;
