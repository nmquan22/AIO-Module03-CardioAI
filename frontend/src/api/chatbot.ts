import axios from "axios";

// Định nghĩa kiểu dữ liệu mà API chatbot trả về
interface ChatbotResponse {
  reply: string;
}

// Tự động chọn URL backend dựa trên môi trường
// Khi dev (vite chạy localhost) → gọi backend trên localhost
// Khi chạy trong Docker Compose → gọi theo service name backend_app
const BASE_URL =
  import.meta.env.MODE === "development"
    ? "http://localhost:8000/api"
    : "http://backend_app:8000/api";

// Hàm gọi API chatbot, trả về string là câu trả lời của bot
export const askChatbot = async (message: string): Promise<string> => {
  try {
    const response = await axios.post<ChatbotResponse>(`${BASE_URL}/chatbot/`, {
      message,
    });
    return response.data.reply;
  } catch (error) {
    console.error("❌ Chatbot API error:", error);
    throw error;
  }
};
