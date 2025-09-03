import { useState } from "react";
import LoginForm from "./components/LoginForm";
import RegisterForm from "./components/RegisterForm";
import PredictForm from "./components/PredictForm";
import Sidebar from "./components/Sidebar";
import Dashboard from "./components/Dashboard";
import ThreeDViewer from "./components/ThreeDViewer";
import AssistantChat from "./components/AssistantChat";
import IoTDashboard from "./components/IoTDashboard";

function App() {
  const [page, setPage] = useState<"login" | "register" | "app">("login");
  const [activeTab, setActiveTab] = useState<
    "predict" | "3d" | "assistant" | "iot" | "dashboard"
  >("predict");

  const handleLoginSuccess = () => {
    setPage("app");
  };

  const handleRegisterSuccess = () => {
    setPage("app");
  };

  if (page === "login") {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoginForm
          onLoginSuccess={handleLoginSuccess}
          onGoRegister={() => setPage("register")}
        />
      </div>
    );
  }

  if (page === "register") {
    return (
      <div className="flex justify-center items-center h-screen">
        <RegisterForm
          onRegisterSuccess={handleRegisterSuccess}
          onGoLogin={() => setPage("login")}
        />
      </div>
    );
  }

  // Main app layout with sidebar
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} setPage={setPage} />

      {/* Main content */}
      <div className="flex-1 p-6 overflow-y-auto">
        {activeTab === "predict" && <PredictForm />}
        {activeTab === "3d" && <ThreeDViewer />}
        {activeTab === "assistant" && <AssistantChat />}
        {activeTab === "iot" && <IoTDashboard />}
        {activeTab === "dashboard" && <Dashboard />}
      </div>
    </div>
  );
}

export default App;
