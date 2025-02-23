const getLastWeight = (results, exerciseId, index) => {
  for (let i = 0; i < results?.length; i++) {
    const result = results?.find((r) => r?.exerciseId === exerciseId);
    if (result?.sets?.length > index) {
      return result?.sets?.[index]?.weight;
    }
  }

  return null;
};

const getLastTimeOrReps = (results, exerciseId, index) => {
  const result = results?.find((r) => r?.exerciseId === exerciseId);
  if (result?.sets?.length > index) {
    return result?.sets?.[index]?.time || result?.sets?.[index]?.reps;
  }

  return null;
};

const computeWorkoutData = (currentUser, exercises, weightHistory) => {
  if (!currentUser || !exercises) return { workoutData: [], currentWeek: null, allWeeks: [] };

  const filteredWeightHistory = weightHistory
    ?.filter((entry) => !!entry?.reps && !!entry?.weight)
    .reduce((acc, entry) => {
      const existingEntry = acc?.find((e) => e?.exerciseId === entry?.exerciseId);
      if (!existingEntry || new Date(entry?.date) > new Date(existingEntry?.date)) {
        acc = acc?.filter((e) => e?.exerciseId !== entry?.exerciseId);
        acc?.push(entry);
      }
      return acc;
    }, []);

  const currentMesocycle = currentUser?.mesocycles?.find((m) => !m?.done);
  const currentWeek = currentMesocycle?.weeks?.find((w) => {
    const isLastWorkoutRest = !w?.workouts?.[w?.workouts?.length - 1]?.workoutId;
    const areAllWorkoutsCompleted = w?.workouts?.every((wo) => (wo?.workoutId ? wo?.result?.length > 0 : true));

    if (isLastWorkoutRest && areAllWorkoutsCompleted) {
      const completedWorkouts = w?.workouts?.filter((wo) => wo?.result?.length > 0);
      const lastCompletedWorkout = completedWorkouts?.[completedWorkouts?.length - 1];
      const dateOfLastCompletedWorkout = new Date(lastCompletedWorkout?.day);
      const today = new Date();
      dateOfLastCompletedWorkout?.setHours(0, 0, 0, 0);
      today?.setHours(0, 0, 0, 0);
      const diffTime = Math.abs(today - dateOfLastCompletedWorkout);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      return diffDays <= 1;
    }

    return w?.workouts?.some((wo) => !!wo?.workoutId && (!wo?.result || wo?.result?.length === 0));
  });

  const allWorkouts = currentMesocycle?.weeks?.flatMap((w) => w?.workouts) || [];
  const allResults = allWorkouts?.flatMap((w) => w?.result)?.reverse() || [];

  const processWeek = (week) => {
    const mesocycleModifier = currentMesocycle?.mesocycleModifier;
    const weekModifier = week?.weekModifier;

    // 1. Compute workout data
    const workoutsOne = week?.workouts?.map((wo) => {
      const workout = currentUser?.workouts?.find((w) => w?._id === wo?.workoutId);
      const mesocycleWorkout = mesocycleModifier?.length > 0 ? mesocycleModifier?.find((m) => m?._id === wo?.workoutId || m?.name === workout?.name) : null;
      const weekWorkout = weekModifier?.length > 0 ? weekModifier?.find((m) => m?._id === wo?.workoutId || m?.name === workout?.name) : null;

      const computedExercises = weekWorkout?.exercises || mesocycleWorkout?.exercises || workout?.exercises;
      const origin = weekWorkout?.exercises ? "week" : mesocycleWorkout?.exercises ? "mesocycle" : "workout";

      let modifiedWorkout, modifiedExercises;

      if (wo?.modifiedWorkoutId) {
        const modWorkout = currentUser?.workouts?.find((w) => w?._id === wo?.modifiedWorkoutId);
        const modMesocycleWorkout = mesocycleModifier?.length > 0 ? mesocycleModifier?.find((m) => m?._id === wo?.modifiedWorkoutId || m?.name === modWorkout?.name) : null;
        const modWeekWorkout = weekModifier?.length > 0 ? weekModifier?.find((m) => m?._id === wo?.modifiedWorkoutId || m?.name === modWorkout?.name) : null;

        modifiedExercises = modWeekWorkout?.exercises || modMesocycleWorkout?.exercises || modWorkout?.exercises;
        modifiedWorkout = currentUser?.workouts?.find((w) => w?._id === wo?.modifiedWorkoutId);
      }

      return {
        ...wo,
        name: workout?.name,
        exercises: computedExercises?.map((exercise) => ({
          ...exercise,
          sets: exercise?.sets?.map((set) => ({ ...set })),
        })),
        origin,
        modifiedName: modifiedWorkout?.name,
        modifiedWorkout,
        modifiedExercises: modifiedExercises?.map((exercise) => ({
          ...exercise,
          sets: exercise?.sets?.map((set) => ({ ...set })),
        })),
      };
    });

    // 2. Enrich with exercise data
    const workoutsTwo = workoutsOne?.map((wo) => {
      if (!wo?.exercises) return wo;
      return {
        ...wo,
        exercises: wo?.exercises?.map((e) => {
          const exercise = exercises?.find((ex) => ex?._id === e?.exerciseId);
          const lastWeightEntry = filteredWeightHistory?.find((entry) => entry?.exerciseId === e?.exerciseId);

          return {
            ...e,
            ...exercise,
            sets: e?.sets?.map((set, index) => ({
              ...set,
              lastWeight: getLastWeight(allResults, e?.exerciseId, index),
              lastReps: getLastTimeOrReps(allResults, e?.exerciseId, index),
            })),
            lastWeight: lastWeightEntry ? lastWeightEntry?.weight : null,
            lastReps: lastWeightEntry ? lastWeightEntry?.reps : null,
          };
        }),
      };
    });

    // 3. Add description to each exercise
    const workoutsThree = workoutsTwo?.map((wo) => {
      if (!wo?.exercises) return wo;
      const uniqueExercises = [...new Set(wo?.exercises?.map((e) => e?.name))];
      return { ...wo, description: uniqueExercises?.join(", ") };
    });

    return { ...week, workouts: workoutsThree };
  };

  const allWeeks = currentMesocycle?.weeks?.map(processWeek);
  const processedCurrentWeek = allWeeks?.find((w) => w?._id === currentWeek?._id);
  const currentWeekIndex = allWeeks?.findIndex((w) => w?._id === currentWeek?._id);

  return {
    workoutData: processedCurrentWeek?.workouts || [],
    currentWeek: processedCurrentWeek,
    currentWeekIndex,
    allWeeks,
  };
};

export default computeWorkoutData;
