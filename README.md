# Ultra Health AI 🩺🤖🌐

Hệ thống web y tế thông minh tích hợp:  
- **Machine Learning** (dự đoán bệnh tim).  
- **3D Reconstruction** (xây dựng mô hình 3D cho hình ảnh y tế).  
- **AI Assistant** (trợ lý ảo y tế thông minh).  
- **IoT Integration** (kết nối thiết bị y tế, realtime data).  

---

## 🛠️ Tech Stack

### Backend
- Python 3.11
- [FastAPI](https://fastapi.tiangolo.com/)
- MongoDB
- JWT Authentication
- Docker + Docker Compose
- ML Model (Scikit-learn / PyTorch)

### Frontend
- [React 18](https://react.dev/) + TypeScript
- [Vite](https://vitejs.dev/)
- [TailwindCSS 4.x](https://tailwindcss.com/)
- Axios

### Extra Features
- **3D Reconstruction** → WebGL / Three.js
- **AI Assistant** → LLM API (OpenAI, LangChain, RAG)
- **IoT** → MQTT / WebSocket

---

## ⚙️ Cấu trúc Project

```
.
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── routes/
│   │   ├── services/
│   │   ├── models/
│   │   ├── ml/              # ML & Predict
│   │   ├── iot/             # IoT integration
│   │   └── ai_assistant/    # Chatbot logic
│   ├── requirements.txt
│   ├── Dockerfile
│   └── docker-compose.yml
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── threeD/          # 3D Reconstruction UI
│   │   └── assistant/       # AI Assistant chat UI
│   ├── vite.config.ts
│   ├── tailwind.config.ts
│   └── package.json
│
└── README.md
```

---

## 🚀 Chạy Backend

```bash
cd backend
docker-compose up --build
```

Mặc định backend chạy tại:
```
http://localhost:8000
```

Docs:
```
http://localhost:8000/docs
```

---

## 💻 Chạy Frontend

```bash
cd frontend
npm install
npm run dev
```

Mặc định frontend chạy tại:
```
http://localhost:5173
```

---

## 🔑 Auth Flow

1. **Đăng ký** tại `/register`.  
2. **Đăng nhập** tại `/login` → trả về `access_token`.  
3. Lưu token trong `localStorage`.  
4. Các API (Predict, 3D, IoT, Assistant) yêu cầu Authorization Header.  

---

## 🧠 Features

### 1. ML Predict
Endpoint:
```http
POST /predict
```

Body:
```json
{
  "age": 45,
  "sex": 1,
  "chol": 240,
  "trestbps": 130
}
```

Response:
```json
{
  "prediction": "Positive",
  "confidence": 0.87
}
```

---

### 2. 3D Reconstruction (Planned)
- Upload ảnh y tế (CT/MRI).  
- Backend xử lý → trả mô hình 3D (.glb / .obj).  
- Frontend render bằng **Three.js**.  

---

### 3. AI Assistant (Planned)
- Chat UI trên frontend.  
- Kết nối **LLM API** để tư vấn sức khỏe.  
- Hỗ trợ tri thức y tế nội bộ (RAG).  

---

### 4. IoT Integration (Planned)
- Backend lắng nghe **MQTT/WebSocket**.  
- Nhận dữ liệu từ thiết bị (nhịp tim, huyết áp,...).  
- Frontend hiển thị realtime dashboard.  

---

## 📌 TODO

- [x] Backend Auth (JWT + MongoDB).  
- [x] API ML Predict.  
- [x] Frontend Login / Register / Predict.  
- [ ] 3D Reconstruction pipeline.  
- [ ] AI Assistant (Chatbot).  
- [ ] IoT Realtime Dashboard.  
- [ ] Unit Tests & CI/CD.  

---

## 📝 License
MIT © 2025 Ultra Health AI
