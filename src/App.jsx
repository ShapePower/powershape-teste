import "./styles/main.scss";
import "./normalize.css";
import { Switch, Route } from "react-router-dom";
import { IonApp, IonRouterOutlet, IonTabs, setupIonicReact } from "@ionic/react";
import { IonReactRouter } from "@ionic/react-router";
import SplashScreen from "./screens/SplashScreen.jsx";
import LoginScreen from "./screens/LoginScreen.jsx";
import HomeScreen from "./screens/HomeScreen.jsx";
import HistoryScreen from "./screens/HistoryScreen.jsx";
import EvolutionScreen from "./screens/EvolutionScreen.jsx";
import ProfileScreen from "./screens/ProfileScreen.jsx";
import CardioScreen from "./screens/CardioScreen.jsx";
import WorkoutRunScreen from "./screens/WorkoutRunScreen.jsx";
import PaymentScreen from "./screens/PaymentScreen.jsx";
import CardioRunScreen from "./screens/CardioRunScreen.jsx";
import { useEffect } from "react";
import TimerModal from "./components/TimerModal.jsx";
import useStore from "./lib/store.js";

setupIonicReact();

const App = () => {
  const timerTime = useStore((state) => state.timerTime);

  useEffect(() => {
    const detectBottomNotch = () => {
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
      if (isIOS) {
        const bottomInset = parseInt(getComputedStyle(document.documentElement).getPropertyValue("--sat-bottom")) || 0;
        return bottomInset > 0;
      }
      return false;
    };

    const updateViewportHeight = () => {
      const vh = window.innerHeight * 0.01;
      const hasBottomNotch = detectBottomNotch();
      const bottomOffset = hasBottomNotch ? 92 : 68;
      const navPaddingBottom = hasBottomNotch ? 24 : 8;

      document.documentElement.style.setProperty("--vh", `${vh}px`);
      document.documentElement.style.setProperty("--bottom-offset", `${bottomOffset}px`);
      document.documentElement.style.setProperty("--nav-pb", `${navPaddingBottom}px`);
    };

    updateViewportHeight();

    window.addEventListener("resize", updateViewportHeight);
    window.addEventListener("orientationchange", updateViewportHeight);

    return () => {
      window.removeEventListener("resize", updateViewportHeight);
      window.removeEventListener("orientationchange", updateViewportHeight);
    };
  }, []);

  return (
    <IonApp>
      <IonReactRouter>
        <IonTabs>
          <IonRouterOutlet className="router-outlet">
            <Switch>
              <Route exact path="/" component={SplashScreen} />
              <Route exact path="/login" component={LoginScreen} />
              <Route exact path="/home" component={HomeScreen} />
              <Route exact path="/cardio" component={CardioScreen} />
              <Route exact path="/history" component={HistoryScreen} />
              <Route exact path="/evolution" component={EvolutionScreen} />
              <Route exact path="/payments" component={PaymentScreen} />
              <Route exact path="/profile" component={ProfileScreen} />
              <Route exact path="/workout/:workoutId" component={WorkoutRunScreen} />
              <Route exact path="/cardio/:cardioId" component={CardioRunScreen} />
            </Switch>
          </IonRouterOutlet>
        </IonTabs>
      </IonReactRouter>
      <TimerModal time={timerTime} />
    </IonApp>
  );
};

export default App;
