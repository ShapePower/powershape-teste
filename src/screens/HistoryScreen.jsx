import { useMemo, useState } from "react";
import Wrapper from "../components/Wrapper.jsx";
import useStore from "../lib/store.js";
import { Button, Dropdown, Tabs } from "antd";
import { FiCheck, FiChevronDown } from "react-icons/fi";

const tabs = [
  {
    label: "Exercícios",
    key: "exercises",
  },
  {
    label: "Treinos",
    key: "workouts",
  },
];

const formatDate = (date) => {
  const options = { year: "2-digit", month: "numeric", day: "numeric", timeZone: "UTC" };
  return new Date(date).toLocaleDateString("pt-BR", options);
};

const getUniqueExerciseIds = (weightHistory = []) => {
  return [...new Set(weightHistory?.map((n) => n?.exerciseId))];
};

const invertDate = (date) => {
  const [day, month, year] = date?.split("/");
  return `${month}/${day}/${year}`;
};

const getFinishedWorkouts = ({ mesocycles, workouts, exercises }) => {
  const finished = [];

  mesocycles?.forEach((mesocycle) => {
    mesocycle?.weeks?.forEach((week) => {
      week?.workouts?.forEach((workout) => {
        if (workout?.day) finished.push(workout);
      });
    });
  });

  const flattened = finished.flat();

  const mapped = flattened?.map((workout) => {
    const workoutData = workouts?.find((w) => w?._id === workout?.workoutId);
    return { ...workout, name: workoutData?.name, day: formatDate(workout?.day) };
  });

  return mapped
    ?.map((workout) => {
      return {
        ...workout,
        result: workout?.result?.map((r) => {
          const exerciseData = exercises?.find((e) => e?._id === r?.exerciseId);
          return { ...r, name: exerciseData?.name };
        }),
        day: invertDate(workout?.day),
      };
    })
    .sort((a, b) => new Date(b.day) - new Date(a.day))
    .map((workout) => ({ ...workout, day: invertDate(workout?.day) }));
};

const formatWeightHistory = (weightHistory = []) => {
  return weightHistory?.map((item) => ({
    exerciseId: item?.exerciseId,
    date: formatDate(item?.date),
    weight: item?.weight,
    reps: item?.reps,
  }));
};

const HistoryScreen = ({ history }) => {
  const [activeTab, setActiveTab] = useState("exercises");
  const [activeExercise, setActiveExercise] = useState(null);
  const [expandedWorkout, setExpandedWorkout] = useState(null);
  const mesocycles = useStore((state) => state.currentUser?.mesocycles);
  const workouts = useStore((state) => state.currentUser?.workouts);
  const weightHistory = useStore((state) => state.currentUser?.weightHistory);
  const exercises = useStore((state) => state.exercises);
  const hasActiveExercise = activeExercise !== null && activeExercise !== "-" && exercises?.find((e) => e._id === activeExercise);

  const finishedWorkouts = useMemo(() => getFinishedWorkouts({ mesocycles, workouts, exercises }), [mesocycles, workouts, exercises]);

  const items = useMemo(() => {
    return [
      { label: "-", key: "-" },
      ...getUniqueExerciseIds(weightHistory)
        ?.map((exerciseId) => exercises.find((e) => e._id === exerciseId))
        ?.filter(Boolean)
        ?.map((exercise) => ({ label: exercise?.name, key: exercise?._id })),
    ];
  }, [weightHistory, exercises]);

  const filteredWeightHistory = useMemo(() => {
    return hasActiveExercise ? formatWeightHistory(weightHistory.filter((item) => item?.exerciseId === activeExercise)) : [];
  }, [weightHistory, activeExercise]);

  const getDropdownLabel = () => {
    return hasActiveExercise ? items.find((e) => e.key === activeExercise)?.label : "Selecione um exercício";
  };

  const expandWorkout = (workoutId, index) => {
    const uniqueId = `${workoutId}-${index}`;
    if (expandedWorkout === uniqueId) setExpandedWorkout(null);
    else setExpandedWorkout(uniqueId);
  };

  return (
    <Wrapper className="history" history={history}>
      <div className="history-container">
        <h2>Histórico</h2>
        <Tabs size="large" items={tabs} activeKey={activeTab} onChange={(key) => setActiveTab(key)} />
        <div className="history-content">
          {activeTab === "exercises" && (
            <>
              <div className="history-header">
                <Dropdown menu={{ items, onClick: (e) => setActiveExercise(e.key) }} trigger={["click"]}>
                  <Button size="large" icon={<FiChevronDown />} iconPosition="end">
                    {getDropdownLabel()}
                  </Button>
                </Dropdown>
              </div>
              <div className="history-table">
                <div className="history-table-headers">
                  <div className="history-table-header">Data</div>
                  <div className="history-table-header">Repetições</div>
                  <div className="history-table-header">Peso</div>
                </div>
                <div className="history-table-body">
                  {!filteredWeightHistory.length && <div className="history-table-empty">-</div>}
                  {filteredWeightHistory.map((item, idx) => (
                    <div key={`${item.exerciseId}-${idx}`} className="history-table-row">
                      <div>{item.date}</div>
                      <div>{item.reps}</div>
                      <div>{item.weight}lb</div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
          {activeTab === "workouts" && (
            <div className="history-workouts">
              {finishedWorkouts?.map((workout, index) => (
                <>
                  <div className="history-workout-item" key={`${workout._id}-${workout.day}`} onClick={() => expandWorkout(workout._id, index)}>
                    <div className="history-workout-name">{workout.name}</div>
                    <div className="history-workout-day">
                      <span>{workout.day}</span>
                      <FiCheck />
                    </div>
                  </div>
                  {expandedWorkout === `${workout._id}-${index}` && (
                    <div className="history-workout-exercises">
                      {workout.result.map((exercise, idx) => (
                        <div key={`${exercise._id}-${idx}`}>
                          <div className="history-workout-exercise-name">{exercise.name}</div>
                          <div className="exercise-table">
                            <div className="exercise-table-headers">
                              <div className="exercise-table-header">Reps</div>
                              <div className="exercise-table-header">Reps Feitas</div>
                              <div className="exercise-table-header">Peso</div>
                              <div className="exercise-table-header">Peso Feito</div>
                            </div>
                            <div className="exercise-table-body">
                              {exercise.sets.map((set) => (
                                <div className="exercise-table-row" key={set._id}>
                                  <div>
                                    {set.expectedReps?.min}-{set.expectedReps?.max}
                                  </div>
                                  <div>{set.reps}</div>
                                  <div>{set.expectedWeight}lb</div>
                                  <div>{set.weight}lb</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ))}
            </div>
          )}
        </div>
      </div>
    </Wrapper>
  );
};

export default HistoryScreen;
