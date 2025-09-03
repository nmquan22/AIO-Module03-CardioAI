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

## 🧠 Machine Learning Pipeline

### 1. Data Preprocessing
- Chuẩn hóa dữ liệu xét nghiệm máu (cholesterol, huyết áp, nhịp tim, men gan AST/ALT…).  
- Xử lý giá trị thiếu (mean/median imputation).  
- One-hot encoding cho dữ liệu phân loại (giới tính, bệnh sử).  
- Feature scaling: MinMax hoặc StandardScaler.

### 2. So sánh mô hình Tabular
| Model               | Ưu điểm                     | Nhược điểm                    | Độ chính xác (AUC) |
|----------------------|-----------------------------|-------------------------------|--------------------|
| Logistic Regression  | Dễ triển khai, explainable  | Hiệu năng thấp với dữ liệu phức tạp | 0.78 |
| Random Forest        | Robust, không cần scale nhiều | Model nặng, chậm              | 0.83 |
| XGBoost              | Phổ biến, hiệu năng cao     | Dễ overfit nếu data ít         | 0.87 |
| TabNet               | Deep learning tabular       | Khó train, cần GPU             | 0.85 |
| FT-Transformer       | Hợp với multimodal fusion   | Cần nhiều data                 | 0.86 |

### 3. Ensemble Strategy
- Kết hợp **XGBoost + TabNet** để tận dụng điểm mạnh (XGBoost ổn định, TabNet mạnh với multimodal).  
- Voting ensemble hoặc weighted averaging.  

### 4. Inference
Endpoint:  
```http
POST /predict
```

Body ví dụ:
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

## 🤖 AI Assistant (Chatbot)

- **Patient Mode**: giải thích kết quả đơn giản, dễ hiểu.  
- **Doctor Mode**: cung cấp phân tích chuyên sâu (kết hợp ảnh + dữ liệu xét nghiệm).  
- Công nghệ: **LangChain + RAG + OpenAI API**.  

---

## 📡 IoT Integration

- Mô phỏng thiết bị đo nhịp tim, huyết áp, SpO₂.  
- Data gửi qua **MQTT** → Backend → Frontend Dashboard.  
- Hỗ trợ realtime hiển thị biểu đồ sức khỏe.  

---

## 🔮 Future Work

1. **Chatbot mở rộng**:  
   - Không chỉ dựa vào dữ liệu bảng (lab test), mà còn dự đoán bệnh dựa trên triệu chứng bệnh nhân nhập vào (tương tự module 01).  
   - Thêm **dashboard AI Symptom Checker**: bệnh nhân nhập triệu chứng → chatbot + ML dự đoán khả năng mắc bệnh.  

2. **3D Medical Visualization**:  
   - Dựng ảnh 3D từ nhiều lát cắt 2D (NeRF hoặc GAN-based reconstruction).  
   - Heatmap highlight vùng tổn thương.  

3. **Edge Deployment**:  
   - Nén mô hình (Knowledge Distillation, Quantization).  
   - Deploy lên thiết bị y tế/IoT thật.  

---

## 📌 TODO

- [x] Backend Auth (JWT + MongoDB).  
- [x] API ML Predict.  
- [x] Frontend Login / Register / Predict.  
- [ ] 3D Reconstruction pipeline.  
- [ ] AI Assistant (Chatbot).  
- [ ] IoT Realtime Dashboard.  
- [ ] AI Symptom Checker (Future Work).  
- [ ] Unit Tests & CI/CD.  

---

## 📝 License
MIT © 2025 Ultra Health AI
