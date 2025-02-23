const getNextWorkoutIndex = (workoutData) => {
  const completedWorkouts = workoutData?.filter((w) => w?.result?.length > 0);
  const uncompletedWorkouts = workoutData?.filter((w) => w?.workoutId && !w?.result?.length);

  if (completedWorkouts?.length === 0) return 0;

  // If there's only one uncompleted workout left, return its index
  if (uncompletedWorkouts?.length === 1) {
    return workoutData?.findIndex((w) => w?.workoutId && !w?.result?.length);
  }

  const lastCompletedWorkout = completedWorkouts?.[completedWorkouts?.length - 1];
  const indexOfLastCompletedWorkout = workoutData?.findIndex((workout) => JSON.stringify(workout) === JSON.stringify(lastCompletedWorkout));

  const nextItem = workoutData?.[indexOfLastCompletedWorkout + 1];
  if (nextItem?.workoutId) {
    return indexOfLastCompletedWorkout + 1;
  } else {
    const lastCompletedDay = lastCompletedWorkout?.day;
    const dateOfLastCompleted = new Date(lastCompletedDay);
    const today = new Date();

    dateOfLastCompleted?.setHours(0, 0, 0, 0);
    today?.setHours(0, 0, 0, 0);

    const diffTime = Math.abs(today - dateOfLastCompleted);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 2 ? indexOfLastCompletedWorkout + 2 : indexOfLastCompletedWorkout + 1;
  }
};

export default getNextWorkoutIndex;
