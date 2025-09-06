from fastapi import APIRouter, UploadFile, File
import joblib
import numpy as np
from pydantic import BaseModel
import os

router = APIRouter(prefix="/ml", tags=["Machine Learning"])

MODEL_PATH = "app/ml/xgboost_model.pkl"
model = joblib.load(MODEL_PATH)

class HeartInput(BaseModel):
    age: int
    sex: int
    cp: int
    trestbps: int
    chol: int
    fbs: int
    restecg: int
    thalach: int
    exang: int
    oldpeak: float
    slope: int
    ca: int
    thal: int

@router.post("/predict")
def predict(data: HeartInput):
    X = np.array([[data.age, data.sex, data.cp, data.trestbps, data.chol,
                   data.fbs, data.restecg, data.thalach, data.exang,
                   data.oldpeak, data.slope, data.ca, data.thal]])
    y_pred = model.predict(X)
    return {"prediction": int(y_pred[0])}

@router.post("/reload")
async def reload_model(file: UploadFile = File(...)):
    global model
    path = os.path.join("app/ml", "heart_model.pkl")
    with open(path, "wb") as f:
        f.write(await file.read())
    model = joblib.load(path)
    return {"message": "Model reloaded successfully"}
