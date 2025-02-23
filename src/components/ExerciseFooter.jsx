import { Button } from "antd";
import clsx from "clsx";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

const ExerciseFooter = ({ exercises = [], activeIndex, setActiveIndex, onNext }) => {
  const isDone = (exercise = {}) => {
    return exercise?.sets?.every((set) => set?.done);
  };

  const shouldDisableNext = (exercise = {}) => {
    return activeIndex === exercises?.length - 1 && isDone(exercise);
  };

  return (
    <div className="exercise-footer">
      <div className="exercise-footer-status">
        Exercício {activeIndex + 1}/{exercises?.length}
      </div>
      <div className="exercise-footer-bubbles">
        {exercises?.map((_, index) => (
          <div key={index} className={clsx("exercise-footer-bubble", isDone(exercises[index]) && "active", index === activeIndex && "current")} />
        ))}
      </div>
      <div className="exercise-footer-actions">
        <Button variant="solid" size="large" icon={<FiChevronLeft />} disabled={activeIndex === 0} onClick={() => setActiveIndex(activeIndex - 1)}>
          Anterior
        </Button>
        <Button color="primary" variant="solid" size="large" iconPosition="end" icon={<FiChevronRight />} disabled={shouldDisableNext(exercises?.[activeIndex])} onClick={onNext}>
          Próximo
        </Button>
      </div>
    </div>
  );
};

export default ExerciseFooter;
