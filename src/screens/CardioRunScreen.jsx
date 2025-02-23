import { useEffect, useMemo, useState, useRef } from "react";
import { FiArrowLeft, FiFileText, FiPlay, FiPause, FiChevronLeft, FiChevronRight, FiCheck, FiRotateCcw } from "react-icons/fi";
import { Card, Progress, Modal } from "antd";
import StateHandler from "../components/StateHandler.jsx";
import useStore from "../lib/store.js";
import Button from "../components/Button.jsx";
import computeCardioData from "../lib/computeCardioData.js";
import { AiOutlineFire } from "react-icons/ai";
import { IoSpeedometerOutline } from "react-icons/io5";
import clsx from "clsx";

let interval;

const getStorageKey = (cardioId, userId) => `cardio_progress_${cardioId}_${userId}`;

const CardioRunScreen = ({ history }) => {
  const [totalDuration, setTotalDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeSetIndex, setActiveSetIndex] = useState(0);
  const [displayedSetIndex, setDisplayedSetIndex] = useState(0);
  const currentUser = useStore((state) => state.currentUser);
  const store = useStore();
  const [nextStep, setNextStep] = useState(null);
  const whistleSound = useRef(new Audio("/whistle.mp3"));
  const [showResetModal, setShowResetModal] = useState(false);

  const cardioId = history?.location?.pathname?.split("/")[2];
  const index = new URLSearchParams(history?.location?.search).get("index");

  const { cardioData, currentWeek } = useMemo(() => computeCardioData(currentUser), [currentUser]);
  const cardio = cardioData?.find((n) => n?.cardioId === cardioId);

  const minutes = Math.floor(totalDuration / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (totalDuration % 60).toString().padStart(2, "0");

  const handleReturn = () => {
    if (!nextStep) {
      history.push("/cardio");
    } else {
      setNextStep(false);
    }
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
    saveToLocalStorage(!isPlaying);
  };

  const handleReset = () => {
    setShowResetModal(true);
  };

  const confirmReset = () => {
    setTotalDuration(0);
    setActiveSetIndex(0);
    setDisplayedSetIndex(0);
    setIsPlaying(false);
    setNextStep(null);

    const storageData = {
      cardio,
      startTime: null,
      totalDuration: 0,
      isPlaying: false,
    };
    localStorage.setItem(getStorageKey(cardioId, currentUser._id), JSON.stringify(storageData));

    setShowResetModal(false);
  };

  const saveToLocalStorage = (argIsPlaying) => {
    if (!cardioId || !currentUser?._id) return;

    const storageData = {
      cardio,
      startTime: Date.now() - totalDuration * 1000,
      totalDuration: totalDuration,
      isPlaying: argIsPlaying ?? isPlaying,
    };

    localStorage.setItem(getStorageKey(cardioId, currentUser._id), JSON.stringify(storageData));
  };

  const saveCardio = async () => {
    const modifiedCardio = JSON.parse(JSON.stringify(cardio));
    modifiedCardio.day = new Date().toISOString();
    modifiedCardio.result = { cardioId, sets: cardio?.sets };
    if (modifiedCardio?.sets?.length === 1 && modifiedCardio?.sets[0]?.duration) {
      const minutes = Math.floor(totalDuration / 60);
      modifiedCardio.sets[0].duration = minutes;
    }

    currentWeek.cardios[index] = modifiedCardio;

    await store.saveWeek(currentWeek._id, currentWeek);
    localStorage.removeItem(getStorageKey(cardioId, currentUser._id));
    history.push("/cardio");
    await store.getCurrentUser();
  };

  useEffect(() => {
    if (cardio && currentUser && !totalDuration) {
      const storageKey = getStorageKey(cardioId, currentUser._id);
      const savedData = localStorage.getItem(storageKey);

      if (savedData) {
        const parsed = JSON.parse(savedData);
        const twoHoursAgo = Date.now() - 2 * 60 * 60 * 1000;

        if (parsed.startTime && parsed.startTime > twoHoursAgo) {
          let elapsedTime = parsed.totalDuration;
          if (parsed.isPlaying) {
            elapsedTime = Math.floor((Date.now() - parsed.startTime) / 1000);
            setIsPlaying(true);
          }
          setTotalDuration(elapsedTime);

          // Calculate active set index based on saved duration
          let totalTime = 0;
          let activeIdx = 0;
          for (let i = 0; i < cardio.sets.length; i++) {
            const duration = parseInt(cardio.sets[i].duration || 0) * 60;
            if (elapsedTime <= totalTime + duration) {
              activeIdx = i;
              break;
            }
            totalTime += duration;
          }
          setActiveSetIndex(activeIdx);
          setDisplayedSetIndex(activeIdx);
          return;
        } else {
          localStorage.removeItem(storageKey);
        }
      }
    }
  }, [cardio, currentUser, cardioId]);

  useEffect(() => {
    if (isPlaying) {
      interval = setInterval(() => {
        setTotalDuration((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  useEffect(() => {
    if (cardio?.sets) {
      let totalTime = 0;
      for (let i = 0; i < cardio.sets.length; i++) {
        const duration = parseInt(cardio.sets[i].duration || 0) * 60;
        if (totalDuration <= totalTime + duration) {
          setActiveSetIndex(i);
          break;
        }
        totalTime += duration;
      }

      const currentSet = cardio.sets[activeSetIndex];
      const currentSetDuration = parseInt(currentSet?.duration || 0) * 60;
      const setEndTime = currentSetDuration - (totalDuration % currentSetDuration);

      if (setEndTime === 1 && totalDuration > 0) {
        whistleSound.current.currentTime = 0;
        whistleSound.current.play().catch((err) => console.log("Audio play failed:", err));

        if (activeSetIndex === cardio.sets.length - 1) {
          setIsPlaying(false);
        } else {
          setDisplayedSetIndex(activeSetIndex + 1);
        }
      }
    }
  }, [totalDuration, cardio]);

  // Preload audio when component mounts
  useEffect(() => {
    whistleSound.current.load();
  }, []);

  useEffect(() => {
    setTimeout(() => {
      saveToLocalStorage();
    }, 1000);
  }, [totalDuration, cardioId, currentUser?._id, isPlaying]);

  return (
    <main className="run">
      <header className="run-header">
        <Button className="icon" onClick={handleReturn}>
          <FiArrowLeft />
        </Button>
        <div className="run-header-right">
          <Button className="icon sm" onClick={handleReset}>
            <FiRotateCcw />
          </Button>
          <Button className="sm" onClick={nextStep ? saveCardio : () => setNextStep(true)}>
            {nextStep ? "Salvar" : "Concluir"}
          </Button>
        </div>
      </header>

      <div className="run-info cardio">
        <div className="cardio-name">{cardio?.name}</div>
      </div>
      <div className="cardio-panes">
        {cardio?.comment && (
          <div className="cardio-pane">
            <div className="cardio-pane-title">
              <FiFileText />
              <span>Descrição</span>
            </div>
            <div className="cardio-pane-description">{cardio?.comment}</div>
          </div>
        )}
        <Card className="countdown-section">
          <div className="countdown-box">
            <span className="countdown-text">{`${minutes}:${seconds}`}</span>
          </div>
          <Button className={`icon lg ${isPlaying ? "pause" : "play"}`} onClick={handlePlayPause}>
            {isPlaying ? <FiPause /> : <FiPlay />}
          </Button>
        </Card>
        <div className="cardio-sets" style={{ position: "relative" }}>
          {cardio?.sets?.map((set, idx) => {
            if (idx !== displayedSetIndex) return null;

            const duration = parseInt(set.duration || 0) * 60;
            const progress = idx === activeSetIndex ? ((totalDuration % duration) / duration) * 100 : 0;
            const isCompleted = idx < activeSetIndex;
            const isFuture = idx > activeSetIndex;

            return (
              <Card key={idx} className={clsx("cardio-set", idx === activeSetIndex && "active")}>
                <div className="cardio-set-header" style={{ color: isFuture || isCompleted ? "#666" : "inherit" }}>
                  <h3>
                    Set {idx + 1} {isCompleted && <FiCheck style={{ color: "green" }} />}
                  </h3>
                  {!!set.duration && <div>{set.duration}min</div>}
                </div>
                {idx === activeSetIndex && <Progress percent={progress} showInfo={false} strokeColor="#DFFf31" />}
                <div className="cardio-set-details" style={{ color: isFuture || isCompleted ? "#666" : "inherit" }}>
                  {!!set.intensity && (
                    <div>
                      <AiOutlineFire /> Intensidade: {set.intensity}
                    </div>
                  )}
                  {!!set.speed && (
                    <div>
                      <IoSpeedometerOutline /> Velocidade: {set.speed}
                    </div>
                  )}
                  {!!set.calories && (
                    <div>
                      <AiOutlineFire /> Calorias: {set.calories}kcal
                    </div>
                  )}
                </div>
                <div className="cardio-sets-arrows">
                  <Button className="icon sm" onClick={() => setDisplayedSetIndex((prev) => prev - 1)} disabled={displayedSetIndex === 0}>
                    <FiChevronLeft />
                  </Button>
                  <Button className="icon sm" onClick={() => setDisplayedSetIndex((prev) => prev + 1)} disabled={displayedSetIndex === cardio?.sets?.length - 1}>
                    <FiChevronRight />
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      <Modal className="reset-modal" title="Reiniciar treino" open={showResetModal} onOk={confirmReset} onCancel={() => setShowResetModal(false)}>
        <p>Tem certeza que deseja reiniciar o treino?</p>
      </Modal>

      <StateHandler />
    </main>
  );
};

export default CardioRunScreen;
