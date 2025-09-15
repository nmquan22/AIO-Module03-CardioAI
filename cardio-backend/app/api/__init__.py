# from fastapi import FastAPI
# from dotenv import load_dotenv

# Tải các biến môi trường từ file .env
# load_dotenv()

# Import các router hiện có của bạn
# from . import auth
# from . import user
# --- THÊM DÒNG NÀY ---
# Import router của chatbot mà chúng ta vừa tạo
# from . import chatbot_router

# Khởi tạo ứng dụng FastAPI
#app = FastAPI(
#   title="CardioAI API",
#    description="API for CardioAI services including prediction, auth, and chatbot.",
#   version="1.0.0"
#)

# --- KẾT NỐI CÁC ROUTER ---
# Thêm các endpoint từ các router có sẵn của bạn
# app.include_router(auth.router)
# app.include_router(user.router)

# --- THÊM DÒNG NÀY ---
# Thêm router của chatbot vào ứng dụng chính
# prefix="/api" sẽ làm cho đường dẫn cuối cùng là /api/chatbot/
# app.include_router(chatbot_router.router, prefix="/api")


# @app.get("/")
# def read_root():
#    return {"message": "Welcome to CardioAI API"}

