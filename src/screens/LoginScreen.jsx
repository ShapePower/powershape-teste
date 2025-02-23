import axios from "axios";
import { useEffect, useState } from "react";
import { FiArrowLeft } from "react-icons/fi";
import { Preferences } from "@capacitor/preferences";
import Button from "../components/Button.jsx";
import Input from "../components/Input.jsx";
import { API_URL } from "../lib/constants.js";
import useProtectedRoute from "../hooks/useProtectedRoute.js";

const LoginScreen = ({ history }) => {
  useProtectedRoute(false);
  const [step, setStep] = useState(0);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReturn = () => {
    if (step === 1) {
      setStep(0);
    } else {
      history.goBack();
    }
  };

  const handleContinue = async () => {
    if (step === 0) {
      setStep(1);
    } else {
      if (loading || !password) return;

      setLoading(true);
      try {
        const response = await axios.post(`${API_URL}/login`, {
          email: email.trim().toLowerCase(),
          password,
        });
        const { token, user } = response.data;

        await Preferences.set({ key: "userToken", value: token });
        await Preferences.set({
          key: "userObject",
          value: JSON.stringify(user),
        });
        history.push("/home");
      } catch (err) {
        setError("E-mail ou senha inválidos. Tente novamente.");
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Enter") {
        handleContinue();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <main className="login wrapper">
      <div className="login-header">
        <Button className="icon" onClick={handleReturn}>
          <FiArrowLeft />
        </Button>
        <span>Entrar</span>
      </div>
      {step === 0 && (
        <div className="login-content">
          <h1>Digite seu e-mail</h1>
          <Input label="E-mail" name="email" placeholder="Digite seu e-mail" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
      )}
      {step === 1 && (
        <div className="login-content">
          <h1>Digite sua senha</h1>
          <Input label="Senha" type="password" name="password" placeholder="Digite sua senha" value={password} onChange={(e) => setPassword(e.target.value)} />
          {error && <span className="error">{error}</span>}
        </div>
      )}
      <div className="login-footer">
        <Button className="full" onClick={handleContinue} disabled={loading}>
          {step === 0 ? "Continuar" : "Entrar"}
        </Button>
      </div>
    </main>
  );
};

export default LoginScreen;
