import { useState } from "react";
import "./Auth.css";
import App from "../../App"; 

export default function Auth() {
  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
  const sendCode = async () => {
    if (!isValidEmail(email)) {
      alert("Введите корректный email");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch("https://api.vyatsu-junior.ru/auth/login", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      console.log("Отправляем код на почту:", email);
      setStep("code");
    } catch (error) {
      console.error("Ошибка при отправке кода:", error);
      alert(`Не удалось отправить код: ${(error as Error).message}`);
    } finally {
      setLoading(false);
    }
  };
  const confirmCode = async () => {
    if (code.length < 4) {
      alert("Введите 4 значный код");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch("https://api.vyatsu-junior.ru/auth/confirm", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code }),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      console.log("Подтверждаем код:", code, "для email:", email);
      alert("Успешный вход!");
      setIsAuthenticated(true); 
    } catch (error) {
      console.error("Ошибка при подтверждении кода:", error);
      alert(`Не удалось подтвердить код: ${(error as Error).message}`);
    } finally {
      setLoading(false);
    }
  };
  if (isAuthenticated) {
    return <App />;
  }
  return (
    <div className="wrapper">
      <div className="cardA">
        <h1 className="titleA">Вход</h1>
        {step === "email" && (
          <>
            <label className="labelA">e-mail</label>
            <input
              className="input"
              placeholder="Введите email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
            <button className="buttonA" onClick={sendCode} disabled={loading}>
              {loading ? "Отправка..." : "Отправить код"}
            </button>
          </>
        )}
        {step === "code" && (
          <>
            <label className="labelA">код</label>
            <input
              className="input"
              placeholder="Введите код из письма"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              disabled={loading}
            />
            <button className="buttonok" onClick={confirmCode} disabled={loading}>
              {loading ? "Проверка..." : "Подтвердить"}
            </button>
            <button className="back" onClick={() => setStep("email")} disabled={loading}>
              Назад
            </button>
          </>
        )}
      </div>
    </div>
  );
}