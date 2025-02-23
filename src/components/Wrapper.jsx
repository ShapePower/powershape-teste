import clsx from "clsx";
import useProtectedRoute from "../hooks/useProtectedRoute.js";
import useStore from "../lib/store.js";
import Nav from "./Nav.jsx";
import StateHandler from "./StateHandler.jsx";

const Wrapper = ({ children, className = "", history }) => {
  useProtectedRoute(true);
  const isLoading = useStore((state) => state.isLoading);

  return (
    <main className={clsx("wrapper app", className)}>
      {isLoading && <div className="loading-spinner" />}
      {!isLoading && children}
      <Nav history={history} />
      <StateHandler />
    </main>
  );
};

export default Wrapper;
