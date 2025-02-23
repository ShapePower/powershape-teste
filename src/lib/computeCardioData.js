const computeCardioData = (currentUser) => {
  if (!currentUser) return [];

  const currentMesocycle = currentUser?.mesocycles.find((m) => !m.done);
  const currentWeek = currentMesocycle?.weeks.find((w) => {
    const isLastWorkoutRest = !w.workouts[w.workouts.length - 1]?.workoutId;
    const areAllWorkoutsCompleted = w.workouts.every((wo) => (wo.workoutId ? wo?.result?.length > 0 : true));

    if (isLastWorkoutRest && areAllWorkoutsCompleted) {
      const completedWorkouts = w.workouts.filter((wo) => wo?.result?.length > 0);
      const lastCompletedWorkout = completedWorkouts[completedWorkouts.length - 1];
      const dateOfLastCompletedWorkout = new Date(lastCompletedWorkout.day);
      const today = new Date();
      dateOfLastCompletedWorkout.setHours(0, 0, 0, 0);
      today.setHours(0, 0, 0, 0);
      const diffTime = Math.abs(today - dateOfLastCompletedWorkout);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      return diffDays <= 1;
    }

    return w.workouts.some((wo) => !!wo.workoutId && (!wo?.result || wo?.result?.length === 0));
  });

  const processWeek = (week) => {
    return {
      ...week,
      cardios: week?.cardios?.map((c) => {
        const cardio = currentUser?.cardios.find((w) => w._id === c.cardioId);
        return { ...c, ...cardio };
      }),
    };
  };

  const allWeeks = currentMesocycle?.weeks.map(processWeek);
  const processedCurrentWeek = allWeeks?.find((w) => w._id === currentWeek?._id);
  const currentWeekIndex = allWeeks?.findIndex((w) => w._id === currentWeek?._id);

  return {
    cardioData: processedCurrentWeek?.cardios || [],
    currentWeek: processedCurrentWeek,
    currentWeekIndex,
    allWeeks,
  };
};

export default computeCardioData;
