import { useEffect } from "react";
import useStore from "../lib/store.js";
import { Preferences } from "@capacitor/preferences";

const StateHandler = () => {
  const store = useStore();
  const currentUser = useStore((state) => state.currentUser);
  const exercises = useStore((state) => state.exercises);
  const setTypes = useStore((state) => state.setTypes);
  const weekTypes = useStore((state) => state.weekTypes);
  const needsToLogout = useStore((state) => state.needsToLogout);

  useEffect(() => {
    const fetchData = async () => {
      store.setIsLoading(true);
      await Promise.all([
        currentUser ? () => {} : store.getCurrentUser(),
        exercises.length === 0 ? store.getExercises() : null,
        setTypes.length === 0 ? store.getSetTypes() : null,
        weekTypes.length === 0 ? store.getWeekTypes() : null,
      ]);
      store.setIsLoading(false);

      if (needsToLogout) {
        await Preferences.clear();
        window.location.href = "/login";
        store.setNeedsToLogout(false);
      }
    };

    fetchData();
  }, []);

  return null;
};

export default StateHandler;
