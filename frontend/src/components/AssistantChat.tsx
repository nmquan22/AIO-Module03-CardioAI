import { useState } from "react";
import { askChatbot } from "../api/chatbot";

function AssistantChat() {
  const [messages, setMessages] = useState<
    { role: "user" | "bot"; text: string }[]
  >([
    {
      role: "bot",
      text: "Xin chào 👋, tôi là CardioAI – trợ lý AI y tế. Bạn muốn hỏi gì hôm nay?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { role: "user" as const, text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const reply = await askChatbot(input);
      setMessages((prev) => [...prev, { role: "bot", text: reply }]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          text: "❌ Không thể kết nối tới server. Vui lòng thử lại sau.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow h-full flex flex-col">
      <h2 className="text-2xl font-bold mb-4">AI Assistant</h2>

      {/* Khu vực hiển thị tin nhắn */}
      <div className="flex-1 overflow-y-auto mb-4 space-y-2">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`p-2 rounded-lg max-w-xs ${
              msg.role === "user"
                ? "bg-blue-500 text-white ml-auto"
                : "bg-gray-200 text-black mr-auto"
            }`}
          >
            {msg.text}
          </div>
        ))}
        {loading && (
          <div className="p-2 rounded-lg max-w-xs bg-gray-200 text-black mr-auto">
            ⏳ Đang suy nghĩ...
          </div>
        )}
      </div>

      {/* Khu vực nhập tin nhắn */}
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Nhập tin nhắn..."
          className="flex-1 border rounded px-3 py-2"
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button
          onClick={sendMessage}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          disabled={loading}
        >
          Gửi
        </button>
      </div>
    </div>
  );
}

export default AssistantChat;
