import { Input } from "antd";
import clsx from "clsx";
import { debounce } from "lodash";
import { useCallback, useEffect, useState } from "react";
import { FiAlignLeft, FiCheck, FiClock } from "react-icons/fi";
import useStore from "../lib/store.js";
import Button from "./Button.jsx";

const ExercisePane = ({ exercise = {}, activeIndex, onSetDone }) => {
  const [lastCompletedSet, setLastCompletedSet] = useState(null);
  const [inputValues, setInputValues] = useState({});
  const setTypes = useStore((state) => state.setTypes);
  const isTimeInsteadOfReps = exercise?.sets?.some((set) => "time" in set);
  const avgRestTime = exercise?.sets?.reduce((acc, curr) => acc + curr.rest, 0) / exercise?.sets?.length;

  useEffect(() => {
    if (exercise?.sets) {
      const initialValues = {};
      exercise.sets.forEach((set, index) => {
        initialValues[`weight-${exercise.exerciseId}-${index}`] = set?.weight ? set.weight : set.lastWeight;
        initialValues[`reps-${exercise.exerciseId}-${index}`] = (isTimeInsteadOfReps ? set?.time : set?.reps) ? (isTimeInsteadOfReps ? set.time : set.reps) : set?.lastReps;
      });
      setInputValues(initialValues);
    }
  }, [exercise?.exerciseId]);

  const getSetType = (set) => {
    const setType = setTypes.find((n) => n._id === set?.type);
    return setType?.name?.replace(" Set", "");
  };

  const debouncedSetWeight = useCallback(
    debounce((index, value) => {
      exercise.sets[index].weight = +value;
    }, 100),
    [exercise]
  );

  const debouncedSetReps = useCallback(
    debounce((index, value) => {
      exercise.sets[index][isTimeInsteadOfReps ? "time" : "reps"] = +value;
    }, 100),
    [isTimeInsteadOfReps, exercise]
  );

  const handleSetWeight = (index, value) => {
    setInputValues((prev) => ({ ...prev, [`weight-${exercise?.exerciseId}-${index}`]: value }));
    debouncedSetWeight(index, value);
  };

  const handleSetReps = (index, value) => {
    setInputValues((prev) => ({ ...prev, [`reps-${exercise?.exerciseId}-${index}`]: value }));
    debouncedSetReps(index, value);
  };

  const isNext = (index) => {
    return lastCompletedSet === index - 1;
  };

  const formatVideoUrl = (url) => {
    if (!url) return null;

    if (url.includes("vimeo.com")) {
      return url.replace("https://vimeo.com/", "https://player.vimeo.com/video/");
    }

    if (url.includes("youtube.com")) {
      return url.replace("https://www.youtube.com/watch?v=", "https://www.youtube.com/embed/");
    }

    return url;
  };

  useEffect(() => {
    setLastCompletedSet(null);
  }, [activeIndex]);

  return (
    <div className="exercise-pane">
      <div className="exercise-pane-header">
        <div className="img-wrapper">{exercise?.thumbnailUrl && <img src={exercise?.thumbnailUrl} alt={exercise?.name} />}</div>
        <div className="exercise-pane-title">{exercise?.name}</div>
      </div>
      <div className="exercise-pane-video">
        {exercise?.videoUrl && (
          <iframe
            width="100%"
            height="200px"
            src={formatVideoUrl(exercise?.videoUrl)}
            title={exercise?.name}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        )}
        {!exercise?.videoUrl && <div className="exercise-pane-video-placeholder">Sem vídeo disponível</div>}
      </div>
      <div className="exercise-pane-table">
        <div className="exercise-pane-table-headers">
          <div className="exercise-pane-table-header">Set</div>
          <div className="exercise-pane-table-header">Peso</div>
          <div className="exercise-pane-table-header">Peso</div>
          <div className="exercise-pane-table-header">{isTimeInsteadOfReps ? "Tempo" : "Reps"}</div>
          <div className="exercise-pane-table-header">{isTimeInsteadOfReps ? "Tempo" : "Reps"}</div>
          <div className="exercise-pane-table-header"></div>
        </div>
        {exercise?.sets?.map((set, index) => (
          <div key={index} className={clsx("tr", `tr-${exercise?.exerciseId}-${index}`, isNext(index) && "active", set?.done && "finished", set?.error && "error")}>
            <div>
              <p>{index + 1}</p>
              <p>{getSetType(set)}</p>
            </div>
            <div className="grey">{exercise?.lastWeight || set?.expectedWeight} lb</div>
            <div>
              <Input size="large" type="number" value={inputValues[`weight-${exercise?.exerciseId}-${index}`]} onChange={(e) => handleSetWeight(index, e.target.value)} suffix="lb" />
            </div>
            <div>{isTimeInsteadOfReps ? `${set?.expectedTime}s` : `${set?.expectedReps?.min}-${set?.expectedReps?.max}`}</div>
            <div>
              <Input size="large" type="number" value={inputValues[`reps-${exercise?.exerciseId}-${index}`]} onChange={(e) => handleSetReps(index, e.target.value)} />
            </div>
            <div>
              <Button className="icon sm" onClick={() => onSetDone(index)}>
                <FiCheck />
              </Button>
            </div>
          </div>
        ))}
      </div>
      <div className="exercise-pane-extra">
        {exercise?.comment && (
          <div>
            <div className="exercise-pane-extra-header">
              <FiAlignLeft />
              <p>Comentário: {exercise?.comment}</p>
            </div>
          </div>
        )}
        {avgRestTime > 0 && (
          <div>
            <div className="exercise-pane-extra-header">
              <FiClock />
              <p>Tempo de descanso: {avgRestTime}s</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExercisePane;
