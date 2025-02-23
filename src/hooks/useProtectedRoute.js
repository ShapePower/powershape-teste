import { useEffect, useState } from "react";
import { useHistory, useLocation } from "react-router-dom";
import { Preferences } from "@capacitor/preferences";

const useProtectedRoute = (isProtected) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const history = useHistory();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { value: token } = await Preferences.get({ key: "userToken" });
        const isAuthed = !!token;
        setIsAuthenticated(isAuthed);

        const currentPath = history.location.pathname;

        if (isAuthed && (currentPath === "/" || currentPath === "/login")) {
          history.push("/home");
        } else if (isProtected && !isAuthed) {
          history.push("/");
        }
      } catch (error) {
        setIsAuthenticated(false);
        if (isProtected) history.push("/");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [isProtected, history, location]);

  return { isAuthenticated, isLoading };
};

export default useProtectedRoute;
