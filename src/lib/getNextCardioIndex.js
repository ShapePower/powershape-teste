const getNextCardioIndex = (cardioData) => {
  const completedCardios = cardioData?.filter((c) => c?.result?.length > 0);
  const uncompletedCardios = cardioData?.filter((c) => c?.cardioId && !c?.result?.length);

  if (!completedCardios || completedCardios?.length === 0) return 0;

  // If there's only one uncompleted cardio left, return its index
  if (uncompletedCardios?.length === 1) {
    return cardioData?.findIndex((c) => c?.cardioId && !c?.result?.length);
  }

  const lastCompletedCardio = completedCardios[completedCardios?.length - 1];
  const indexOfLastCompletedCardio = cardioData?.findIndex((cardio) => JSON.stringify(cardio) === JSON.stringify(lastCompletedCardio));

  const nextItem = cardioData?.[indexOfLastCompletedCardio + 1];
  if (nextItem?.cardioId) {
    return indexOfLastCompletedCardio + 1;
  } else {
    const lastCompletedDay = lastCompletedCardio?.day;
    const dateOfLastCompleted = new Date(lastCompletedDay);
    const today = new Date();

    dateOfLastCompleted?.setHours(0, 0, 0, 0);
    today?.setHours(0, 0, 0, 0);

    const diffTime = Math.abs(today - dateOfLastCompleted);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 2 ? indexOfLastCompletedCardio + 2 : indexOfLastCompletedCardio + 1;
  }
};

export default getNextCardioIndex;
