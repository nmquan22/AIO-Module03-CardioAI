import streamlit as st
import requests
import json

# --- Cấu hình trang ---
st.set_page_config(
    page_title="CardioAI Assistant",
    page_icon="🤖"
)

st.title("CardioAI Assistant 💬")
st.write("Hỏi đáp về sức khỏe tim mạch với trợ lý AI của chúng tôi.")

# --- URL của Backend API ---
# SỬA LỖI: Đổi tên host từ 'backend' thành 'backend_app' để khớp với
# tên service trong file docker-compose.yml
BACKEND_URL = "http://backend_app:8000/api/chatbot/"


# --- Khởi tạo lịch sử chat trong session state ---
if "messages" not in st.session_state:
    st.session_state.messages = [
        {"role": "assistant", "content": "Chào bạn! Tôi là CardioAI, tôi có thể giúp gì cho bạn về sức khỏe tim mạch?"}
    ]

# --- Hiển thị các tin nhắn đã có ---
for message in st.session_state.messages:
    with st.chat_message(message["role"]):
        st.markdown(message["content"])

# --- Nhận input từ người dùng ---
if prompt := st.chat_input("Câu hỏi của bạn là gì?"):
    # Thêm tin nhắn của người dùng vào lịch sử và hiển thị
    st.session_state.messages.append({"role": "user", "content": prompt})
    with st.chat_message("user"):
        st.markdown(prompt)

    # Hiển thị tin nhắn của bot và gọi API
    with st.chat_message("assistant"):
        message_placeholder = st.empty()
        message_placeholder.markdown("Đang suy nghĩ...")

        try:
            # Dữ liệu gửi đến backend
            payload = {"message": prompt}
            
            # Gọi API backend
            response = requests.post(BACKEND_URL, json=payload)
            response.raise_for_status()  # Ném lỗi nếu status code là 4xx hoặc 5xx

            # Lấy câu trả lời từ bot
            bot_reply = response.json().get("reply", "Rất tiếc, tôi không nhận được phản hồi.")
            message_placeholder.markdown(bot_reply)
            
            # Thêm câu trả lời của bot vào lịch sử chat
            st.session_state.messages.append({"role": "assistant", "content": bot_reply})

        except requests.exceptions.RequestException as e:
            error_message = f"Lỗi kết nối đến server. Vui lòng đảm bảo container backend đang chạy. Chi tiết: {e}"
            message_placeholder.markdown(error_message)
            st.session_state.messages.append({"role": "assistant", "content": error_message})
        except Exception as e:
            error_message = f"Đã có lỗi xảy ra: {e}"
            message_placeholder.markdown(error_message)
            st.session_state.messages.append({"role": "assistant", "content": error_message})

