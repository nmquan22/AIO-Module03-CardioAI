from fastapi import APIRouter, UploadFile, File, HTTPException
from pydantic import BaseModel, Field, field_validator
from typing import Optional, List
import joblib, numpy as np, os
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline


router = APIRouter(prefix="/ml", tags=["Machine Learning"])

MODEL_PATH = "app/ml/cardio_model.pkl"
model = None

def load_model(path=MODEL_PATH):
    global model
    m = joblib.load(path)
    pre = getattr(m, "named_steps", {}).get("pre", None)
    if not isinstance(m, Pipeline):
        raise RuntimeError("Invalid model: not a sklearn Pipeline")
    if not isinstance(pre, ColumnTransformer):
        raise RuntimeError("Invalid model: step 'pre' must be ColumnTransformer")

    # validate string-transformers chỉ cho phép 'passthrough'/'drop'
    tfms = getattr(pre, "transformers_", None) or pre.transformers
    for name, trans, cols in tfms:
        if isinstance(trans, str) and trans not in ("passthrough", "drop"):
            raise RuntimeError(f"Invalid transformer '{name}': got {trans!r}")
    model = m
    return model


try:
    load_model()
except Exception as e:
    print(f"[WARN] Could not load model at startup: {e}")

# Thứ tự cột đầu vào THÔ cho preprocessor (đã khớp lúc train)
BASE_FEATURE_COLUMNS: List[str] = [
    "age","height","weight","ap_hi","ap_lo",
    "age_years","bmi","bp_diff",
    "gender","cholesterol","gluc","smoke","alco","active","gender_bin",
]

def _nz(v): return np.nan if v is None else v

def build_feature_df(
    *,
    age_days: Optional[float],
    height: Optional[float],
    weight: Optional[float],
    ap_hi: Optional[float],
    ap_lo: Optional[float],
    cholesterol: Optional[float],
    gluc: Optional[float],
    smoke: Optional[float],
    alco: Optional[float],
    active: Optional[float],
    gender: Optional[float],  # 1=female, 2=male
) -> pd.DataFrame:
    age_days = _nz(age_days); height = _nz(height); weight = _nz(weight)
    ap_hi = _nz(ap_hi); ap_lo = _nz(ap_lo)
    cholesterol = _nz(cholesterol); gluc = _nz(gluc)
    smoke = _nz(smoke); alco = _nz(alco); active = _nz(active)
    gender = _nz(gender)

    # Derived features (đúng như notebook train)
    age_years = float(np.floor(age_days / 365.0)) if pd.notna(age_days) else np.nan
    bmi = float(weight / ((height / 100.0) ** 2)) if pd.notna(height) and pd.notna(weight) and float(height) != 0.0 else np.nan
    bp_diff = float(ap_hi - ap_lo) if pd.notna(ap_hi) and pd.notna(ap_lo) else np.nan
    # 1=female→0, 2=male→1 (khớp 'cat__gender_bin_0/1')
    gender_bin = {1.0: 0.0, 2.0: 1.0, 1: 0.0, 2: 1.0}.get(gender, np.nan)

    row = [age_days, height, weight, ap_hi, ap_lo,
           age_years, bmi, bp_diff,
           gender, cholesterol, gluc, smoke, alco, active, gender_bin]

    X_df = pd.DataFrame([row], columns=BASE_FEATURE_COLUMNS)
    # XGB xử lý NaN được; ép float để loại lỗi dtype
    X_df = X_df.astype(float)
    return X_df

class CardioInput(BaseModel):
    age: int
    height: float
    weight: float
    ap_hi: int
    ap_lo: int
    cholesterol: int
    gluc: int
    smoke: int
    alco: int
    active: int
    gender: int

    @field_validator("cholesterol","gluc")
    @classmethod
    def _lvl_1_3(cls, v):
        if v not in (1,2,3): raise ValueError("must be 1, 2, or 3")
        return v
    @field_validator("smoke","alco","active")
    @classmethod
    def _bin_0_1(cls, v):
        if v not in (0,1): raise ValueError("must be 0 or 1")
        return v
    @field_validator("gender")
    @classmethod
    def _gender_1_2(cls, v):
        if v not in (1,2): raise ValueError("gender must be 1 (female) or 2 (male)")
        return v

class CardioFullInput(BaseModel):
    age: Optional[float] = Field(None, description="age in days")
    height: Optional[float] = None
    weight: Optional[float] = None
    ap_hi: Optional[float] = None
    ap_lo: Optional[float] = None
    cholesterol: Optional[float] = Field(None, description="1..3")
    gluc: Optional[float] = Field(None, description="1..3")
    smoke: Optional[float] = Field(None, description="0/1")
    alco: Optional[float] = Field(None, description="0/1")
    active: Optional[float] = Field(None, description="0/1")
    gender: Optional[float] = Field(None, description="1=female, 2=male")

class SimpleInput(BaseModel):
    age: Optional[int] = Field(None, description="years")
    gender: Optional[str] = Field(None, description='"male"/"female"')
    cholesterol: Optional[int] = Field(None, description="1..3")
    bp: Optional[int] = Field(None, description="systolic (ap_hi)")

@router.get("/feature_names")
def feature_names():
    """Thứ tự feature THÔ mà server build gửi vào model (để debug)."""
    return {"feature_order": BASE_FEATURE_COLUMNS}

@router.get("/model_info")
def model_info():
    """Thông tin nhanh để xác nhận preprocessor đã fit và tên cột sau preprocess."""
    if model is None:
        raise HTTPException(status_code=503, detail="Model not loaded")
    info = {"loaded": True, "type": type(model).__name__}
    try:
        pre = getattr(model, "named_steps", {}).get("pre", None)
        info["has_pre"] = pre is not None
        if pre is not None:
            # cần model đã fit
            if hasattr(pre, "get_feature_names_out"):
                try:
                    out = pre.get_feature_names_out()
                    info["pre_feature_names_out"] = list(map(str, out))
                    info["pre_feature_count"] = int(len(out))
                except Exception as e:
                    info["pre_feature_names_out_error"] = str(e)
            else:
                info["pre_feature_names_out_error"] = "no get_feature_names_out"
    except Exception as e:
        info["error"] = str(e)
    return info

@router.post("/predict")
def predict(data: CardioInput):
    if model is None:
        raise HTTPException(status_code=503, detail="Model not loaded")
    X_df = build_feature_df(
        age_days=float(data.age),
        height=float(data.height),
        weight=float(data.weight),
        ap_hi=float(data.ap_hi),
        ap_lo=float(data.ap_lo),
        cholesterol=float(data.cholesterol),
        gluc=float(data.gluc),
        smoke=float(data.smoke),
        alco=float(data.alco),
        active=float(data.active),
        gender=float(data.gender),
    )
    try:
        y = model.predict(X_df)
        pred = int(y[0])
        proba = None
        if hasattr(model, "predict_proba"):
            p = model.predict_proba(X_df)
            proba = float(p[0,1])
        return {"prediction": pred, "prob": proba}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Predict failed: {e}")

@router.post("/predict_full")
def predict_full(payload: CardioFullInput):
    if model is None:
        raise HTTPException(status_code=503, detail="Model not loaded")
    X_df = build_feature_df(
        age_days=payload.age,
        height=payload.height,
        weight=payload.weight,
        ap_hi=payload.ap_hi,
        ap_lo=payload.ap_lo,
        cholesterol=payload.cholesterol,
        gluc=payload.gluc,
        smoke=payload.smoke,
        alco=payload.alco,
        active=payload.active,
        gender=payload.gender,
    )
    try:
        y = model.predict(X_df)
        pred = int(y[0])
        proba = None
        if hasattr(model, "predict_proba"):
            p = model.predict_proba(X_df)
            proba = float(p[0,1])
        return {"prediction": pred, "prob": proba}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Predict failed: {e}")

@router.post("/predict_simple")
def predict_simple(s: SimpleInput):
    if model is None:
        raise HTTPException(status_code=503, detail="Model not loaded")
    age_days = float(s.age)*365 if s.age is not None else None
    ap_hi = float(s.bp) if s.bp is not None else None
    gender_num = None
    if s.gender:
        gender_num = 2.0 if s.gender.lower().startswith("m") else 1.0
    X_df = build_feature_df(
        age_days=age_days,
        height=None,
        weight=None,
        ap_hi=ap_hi,
        ap_lo=None,
        cholesterol=float(s.cholesterol) if s.cholesterol is not None else None,
        gluc=None, smoke=None, alco=None, active=None, gender=gender_num,
    )
    try:
        y = model.predict(X_df)
        pred = int(y[0])
        proba = None
        if hasattr(model, "predict_proba"):
            p = model.predict_proba(X_df)
            proba = float(p[0,1])
        return {"prediction": pred, "prob": proba, "note": "Missing fields sent as NaN."}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Predict failed: {e}")

@router.post("/reload")
async def reload_model(file: UploadFile = File(...)):
    try:
        os.makedirs(os.path.dirname(MODEL_PATH), exist_ok=True)
        with open(MODEL_PATH,"wb") as f:
            f.write(await file.read())
        load_model(MODEL_PATH)
        return {"message":"Model reloaded successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Reload failed: {e}")

@router.get("/ml_health")
def ml_health():
    name = type(model).__name__ if model is not None else None
    return {"loaded": model is not None, "model_type": name}

@router.get("/debug_pipeline")
def debug_pipeline():
    from sklearn.compose import ColumnTransformer
    if model is None:
        raise HTTPException(status_code=503, detail="Model not loaded")
    info = {"type": type(model).__name__, "steps": [n for n,_ in getattr(model, "steps", [])]}
    pre = getattr(model, "named_steps", {}).get("pre", None)
    info["pre_type"] = str(type(pre)) if pre is not None else None
    if isinstance(pre, ColumnTransformer):
        tfms = getattr(pre, "transformers_", None) or getattr(pre, "transformers", None)
        info["pre_transformers"] = [
            {"name": n, "type": str(type(t)), "cols": (list(c) if isinstance(c,(list,tuple)) else str(c))}
            for (n,t,c) in (tfms or [])
        ]
    return info

@router.get("/versions")
def versions():
    import sklearn, xgboost, sys
    return {"python": sys.version, "sklearn": sklearn.__version__, "xgboost": xgboost.__version__}

