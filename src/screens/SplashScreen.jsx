import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Button from "../components/Button.jsx";
import useProtectedRoute from "../hooks/useProtectedRoute.js";

const SplashScreen = ({ history }) => {
  useProtectedRoute(false);
  const [step, setStep] = useState(0);
  const logo =
    step === 0 ? "images/logo-gradient.svg" : "images/logo-white.svg";

  const handleClick = () => {
    history.push("/login");
  };

  useEffect(() => {
    setTimeout(() => {
      setStep(1);
    }, 500);
  }, []);

  return (
    <AnimatePresence mode="popLayout">
      <motion.main
        layout
        className="splash wrapper"
        data-step={step}
        initial={{ justifyContent: "center" }}
        animate={{ justifyContent: step === 1 ? "space-between" : "center" }}
        transition={{ type: "spring", duration: 0.5, bounce: 0 }}
      >
        <motion.img
          layout
          src={logo}
          alt="Power Shape"
          initial={{ width: "50%" }}
          animate={{ width: step === 1 ? "150px" : "50%" }}
          transition={{ type: "spring", duration: 0.5, bounce: 0 }}
        />
        <AnimatePresence>
          {step === 1 && (
            <motion.div
              className="splash-bottom"
              initial={{ opacity: 0, y: -100 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", duration: 0.5, bounce: 0 }}
            >
              <h1>
                Saúde e energia a<br />
                cada <span className="highlight">treino.</span>
              </h1>
              <Button className="full" onClick={handleClick}>
                Entre na sua conta
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.main>
    </AnimatePresence>
  );
};

export default SplashScreen;
