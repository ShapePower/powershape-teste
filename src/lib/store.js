import axios from "axios";
import { create } from "zustand";
import { API_URL } from "./constants.js";
import getUserData from "./getUserData.js";

const useStore = create((set) => ({
  isLoading: false,
  currentUser: null,
  exercises: [],
  setTypes: [],
  weekTypes: [],
  showTimer: false,
  timerTime: 0,
  displayTime: 0,
  needsToLogout: false,

  getCurrentUser: async () => {
    const { clientId, headers } = await getUserData();
    try {
      const response = await axios.get(`${API_URL}/client/${clientId}`, {
        headers,
      });
      set({ currentUser: response.data });
    } catch (error) {
      set({ needsToLogout: true });
    }
  },

  getExercises: async () => {
    const { headers } = await getUserData();
    const response = await axios.get(`${API_URL}/exercise`, {
      headers,
    });

    set({ exercises: response.data });
  },

  getSetTypes: async () => {
    const { headers } = await getUserData();
    const response = await axios.get(`${API_URL}/setType`, {
      headers,
    });

    set({ setTypes: response.data });
  },

  getWeekTypes: async () => {
    const { headers } = await getUserData();
    const response = await axios.get(`${API_URL}/weekType`, {
      headers,
    });

    set({ weekTypes: response.data });
  },

  setIsLoading: (isLoading) => {
    set({ isLoading });
  },

  clear: () => {
    set({ currentUser: null, exercises: [], setTypes: [] });
  },

  saveWeek: async (weekId, body) => {
    const { headers } = await getUserData();
    await axios.patch(`${API_URL}/week/${weekId}`, body, { headers });
  },

  uploadFiles: async (body) => {
    const { clientId, headers } = await getUserData();
    return await axios.post(`${API_URL}/client/${clientId}/feedback`, body, { headers });
  },

  pushWeightHistory: async ({ workout = [] }) => {
    const { clientId, headers } = await getUserData();
    const formattedWorkout = workout?.map((el) => {
      const obj =
        "time" in el?.sets[0] && +el?.sets[0].time > 0 && Math.max(...el?.sets.map((item) => item.time)) > 0
          ? { time: Math.max(...el?.sets.map((item) => item.time)) }
          : { reps: Math.max(...el?.sets.map((item) => item.reps)) };

      return {
        exerciseId: el?.exerciseId,
        date: new Date().toISOString(),
        ...obj,
        weight: Math.max(...el?.sets.map((item) => item.weight)),
      };
    });

    await axios.post(`${API_URL}/client/${clientId}/weight-history`, { workout: formattedWorkout }, { headers });
  },

  setShowTimer: (showTimer) => {
    set({ showTimer });
  },

  setTimerTime: (timerTime) => {
    set({ timerTime });
  },

  setDisplayTime: (displayTime) => {
    set({ displayTime });
  },

  setNeedsToLogout: (needsToLogout) => {
    set({ needsToLogout });
  },
}));

export default useStore;
