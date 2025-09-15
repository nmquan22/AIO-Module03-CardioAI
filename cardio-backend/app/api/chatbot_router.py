import os
import google.generativeai as genai
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel

# Pydantic model để validate dữ liệu đầu vào
class ChatRequest(BaseModel):
    message: str

# Tạo một router mới với prefix và tag
# prefix="/chatbot" nghĩa là tất cả các endpoint trong router này sẽ bắt đầu bằng /chatbot
# tags=["Chatbot"] giúp nhóm các API lại trong trang tài liệu tự động của FastAPI
router = APIRouter(
    prefix="/chatbot",
    tags=["Chatbot"]
)

# Cấu hình Gemini API
try:
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise ValueError("GEMINI_API_KEY not found in environment variables.")
    genai.configure(api_key=api_key)
    model = genai.GenerativeModel('gemini-1.5-flash')
except Exception as e:
    print(f"Error initializing Gemini model: {e}")
    model = None

# Endpoint này sẽ có đường dẫn là /api/chatbot/
@router.post("/", status_code=status.HTTP_200_OK)
async def handle_chat(request: ChatRequest):
    if model is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="AI service is not configured correctly."
        )

    user_message = request.message
    if not user_message:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Message is required"
        )

    # Prompt Engineering: Hướng dẫn AI cách trả lời
    prompt = f"""
    Bạn là một trợ lý AI chuyên về sức khỏe tim mạch tên là CardioAI.
    Hãy trả lời câu hỏi của người dùng một cách chính xác, ngắn gọn và dễ hiểu.
    Luôn luôn nhắc nhở người dùng rằng thông tin này chỉ mang tính tham khảo và họ cần phải tham khảo ý kiến của bác sĩ chuyên khoa để có chẩn đoán chính xác.
    Tuyệt đối không đưa ra chẩn đoán y tế.

    Câu hỏi của người dùng: "{user_message}"
    """

    try:
        response = model.generate_content(prompt)
        return {"reply": response.text}
    except Exception as e:
        print(f"Error calling Gemini API: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while communicating with the AI service."
        )

