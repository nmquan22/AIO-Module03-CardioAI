import { useState } from "react";
import LoginForm from "./components/LoginForm";
import RegisterForm from "./components/RegisterForm"
import PredictForm from "./components/PredictForm";

function App() {
  const [page, setPage] = useState("login"); // login | register | predict

  const handleLoginSuccess = () => {
    setPage("predict");
  };

  const handleRegisterSuccess = () => {
    setPage("predict");
  };

  return (
    <div className="flex justify-center items-center h-screen">
      {page === "login" && (
        <LoginForm
          onLoginSuccess={handleLoginSuccess}
          onGoRegister={() => setPage("register")}
        />
      )}
      {page === "register" && (
        <RegisterForm
          onRegisterSuccess={handleRegisterSuccess}
          onGoLogin={() => setPage("login")}
        />
      )}
      {page === "predict" && <PredictForm />}
    </div>
  );
}

export default App;
