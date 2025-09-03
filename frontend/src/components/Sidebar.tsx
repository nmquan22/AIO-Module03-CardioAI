type SidebarProps = {
  activeTab: string;
  setActiveTab: (tab: any) => void;
  setPage: (p: "login" | "register" | "app") => void;
};

function Sidebar({ activeTab, setActiveTab, setPage }: SidebarProps) {
  return (
    <div className="w-64 bg-white shadow-lg flex flex-col">
      <div className="p-4 text-2xl font-bold border-b">Ultra Health AI 🩺</div>
      <nav className="flex-1 p-4 space-y-2">
        <button
          className={`w-full text-left p-2 rounded ${
            activeTab === "predict" ? "bg-blue-500 text-white" : "hover:bg-gray-200"
          }`}
          onClick={() => setActiveTab("predict")}
        >
          Predict
        </button>
        <button
          className={`w-full text-left p-2 rounded ${
            activeTab === "3d" ? "bg-blue-500 text-white" : "hover:bg-gray-200"
          }`}
          onClick={() => setActiveTab("3d")}
        >
          3D Reconstruction
        </button>
        <button
          className={`w-full text-left p-2 rounded ${
            activeTab === "assistant" ? "bg-blue-500 text-white" : "hover:bg-gray-200"
          }`}
          onClick={() => setActiveTab("assistant")}
        >
          AI Assistant
        </button>
        <button
          className={`w-full text-left p-2 rounded ${
            activeTab === "iot" ? "bg-blue-500 text-white" : "hover:bg-gray-200"
          }`}
          onClick={() => setActiveTab("iot")}
        >
          IoT Dashboard
        </button>
        <button
          className={`w-full text-left p-2 rounded ${
            activeTab === "dashboard" ? "bg-blue-500 text-white" : "hover:bg-gray-200"
          }`}
          onClick={() => setActiveTab("dashboard")}
        >
          Patient Dashboard
        </button>
      </nav>
      <div className="p-4 border-t">
        <button
          className="w-full text-left p-2 rounded bg-red-500 text-white"
          onClick={() => setPage("login")}
        >
          Logout
        </button>
      </div>
    </div>
  );
}

export default Sidebar;
