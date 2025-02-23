import { LocalNotifications } from "@capacitor/local-notifications";
import { Modal } from "antd";
import clsx from "clsx";
import { useEffect, useRef, useState } from "react";
import { PiArrowClockwise } from "react-icons/pi";
import useStore from "../lib/store.js";
import Button from "./Button.jsx";

const tabs = [
  {
    id: "cronometer",
    label: "Cronômetro",
  },
  {
    id: "timer",
    label: "Timer",
  },
];

const TimerModal = ({ time = 0 }) => {
  const open = useStore((state) => state.showTimer);
  const setShowTimer = useStore((state) => state.setShowTimer);
  const setDisplayTime = useStore((state) => state.setDisplayTime);
  const [activeTime, setActiveTime] = useState(time);
  const [timerTime, setTimerTime] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isTimerPaused, setIsTimerPaused] = useState(true);
  const [activeTab, setActiveTab] = useState("cronometer");
  const [closeOnEnd, setCloseOnEnd] = useState(false);
  const [shouldPlayAlarm, setShouldPlayAlarm] = useState(false);
  const alarmSound = useRef(new Audio("/plim.mp3"));
  const whistleSound = useRef(new Audio("/whistle.mp3"));
  const timerWorker = useRef(null);

  const minutes = Math.floor(activeTime / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (activeTime % 60).toString().padStart(2, "0");

  const timerHours = Math.floor(timerTime / 3600)
    .toString()
    .padStart(2, "0");
  const timerMinutes = Math.floor((timerTime % 3600) / 60)
    .toString()
    .padStart(2, "0");
  const timerSeconds = (timerTime % 60).toString().padStart(2, "0");

  useEffect(() => {
    const requestPermissions = async () => {
      const { display, alert, badge } = await LocalNotifications.requestPermissions();
      if (display !== "granted" || alert !== "granted" || badge !== "granted") {
        console.error("Notification permissions not granted");
      }
    };
    requestPermissions();
  }, []);

  useEffect(() => {
    setDisplayTime(`${minutes}:${seconds}`);
  }, [minutes, seconds]);

  useEffect(() => {
    if (open && time) {
      setActiveTime(time);
      setIsPaused(false);
      setCloseOnEnd(true);
      setShouldPlayAlarm(true);
    }
  }, [open, time]);

  const scheduleNotification = async (timeInSeconds) => {
    try {
      await LocalNotifications.schedule({
        notifications: [
          {
            title: "Timer concluído!",
            body: "É hora do próximo exercício.",
            id: 1,
            schedule: { at: new Date(Date.now() + timeInSeconds * 1000) },
            sound: "whistle.mp3",
            attachments: null,
            actionTypeId: "",
            extra: null,
          },
        ],
      });
    } catch (error) {
      console.error("Error scheduling notification:", error);
    }
  };

  useEffect(() => {
    if (!isPaused && activeTime > 0) {
      timerWorker.current = setInterval(() => {
        setActiveTime((prev) => {
          if (prev > 0) {
            return prev - 1;
          }
          return 0;
        });
      }, 1000);

      if (shouldPlayAlarm) {
        scheduleNotification(activeTime);
      }
    }

    return () => {
      if (timerWorker.current) {
        clearInterval(timerWorker.current);
      }
    };
  }, [isPaused, activeTime, shouldPlayAlarm]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!isTimerPaused) {
        setTimerTime((prev) => prev + 1);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isTimerPaused, timerTime]);

  useEffect(() => {
    const playSound = async () => {
      if (activeTime <= 3 && activeTime > 0 && shouldPlayAlarm) {
        try {
          alarmSound.current.currentTime = 0;
          await alarmSound.current.play();
        } catch (error) {
          console.error("Error playing countdown sound:", error);
        }
      } else if (activeTime === 0 && shouldPlayAlarm) {
        try {
          await LocalNotifications.schedule({
            notifications: [
              {
                title: "Timer concluído!",
                body: "É hora do próximo exercício.",
                id: 2,
                schedule: { at: new Date() },
                sound: "whistle.mp3",
                attachments: null,
                actionTypeId: "",
                extra: null,
              },
            ],
          });
        } catch (notificationError) {
          console.error("Error showing notification:", notificationError);
        }

        try {
          whistleSound.current.currentTime = 0;
          await whistleSound.current.play();
        } catch (error) {
          console.error("Error playing end sound:", error);
        }

        if (closeOnEnd) {
          setShowTimer(false);
        }
        setShouldPlayAlarm(false);
      }
    };

    playSound();
  }, [activeTime, shouldPlayAlarm, closeOnEnd]);

  return (
    <Modal centered open={open} onCancel={() => setShowTimer(false)} footer={null} className="DialogContent">
      <div className="DialogTabs">
        {tabs.map((tab, idx) => (
          <Button key={`${tab.id}-${idx}`} className={clsx("sm", activeTab === tab.id ? "primary" : "secondary")} onClick={() => setActiveTab(tab.id)}>
            {tab.label}
          </Button>
        ))}
      </div>
      {activeTab === "cronometer" && (
        <div className="cronometer-container">
          <Button
            className="sm secondary"
            onClick={() => {
              setActiveTime((prev) => Math.max(0, prev - 15));
              setShouldPlayAlarm(true);
            }}
          >
            -15
          </Button>
          <div className={clsx("countdown-box", activeTime === 0 && "done")}>
            <span className="countdown-text">{`${minutes}:${seconds}`}</span>
          </div>
          <Button
            className="sm secondary"
            onClick={() => {
              setActiveTime((prev) => Math.min(60, prev + 15));
              setShouldPlayAlarm(true);
            }}
          >
            +15
          </Button>
        </div>
      )}
      {activeTab === "timer" && (
        <div className="cronometer-container">
          <div className="countdown-box">
            <span className="countdown-text">{`${timerHours}:${timerMinutes}:${timerSeconds}`}</span>
          </div>
        </div>
      )}
      <div className="DialogCenteredActions">
        {activeTab === "timer" && (
          <>
            <Button className="sm icon" onClick={() => setTimerTime(0)}>
              <PiArrowClockwise />
            </Button>
            <Button className={clsx("sm", !isTimerPaused && "secondary")} onClick={() => setIsTimerPaused(!isTimerPaused)}>
              {isTimerPaused ? "Continuar" : "Pausar"}
            </Button>
          </>
        )}
        {activeTab === "cronometer" && (
          <Button className={clsx("sm", !isPaused && "secondary")} onClick={() => setIsPaused(!isPaused)}>
            {isPaused ? "Continuar" : "Pausar"}
          </Button>
        )}
      </div>
    </Modal>
  );
};

export default TimerModal;
