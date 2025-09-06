import joblib
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer

# đường dẫn file .pkl bạn vừa tải từ Kaggle
MODEL_PATH = r"D:\AIO-Module03-cardioAI\cardio-backend\app\ml\cardio_model.pkl"

print("Loading:", MODEL_PATH)
m = joblib.load(MODEL_PATH)

print("Loaded type:", type(m))
if isinstance(m, Pipeline):
    print("Pipeline steps:", [n for n,_ in m.steps])
    pre = m.named_steps.get("pre", None)
    print("pre type:", type(pre))
    if isinstance(pre, ColumnTransformer):
        # show các transformer con
        tfms = getattr(pre, "transformers_", None) or pre.transformers
        for n,t,c in tfms:
            print(f" - {n} | {repr(t)} | cols: {c}")
        # thử lấy tên cột sau preprocess
        try:
            names = pre.get_feature_names_out()
            print("feature_names_out (len):", len(names))
            print("sample:", list(names)[:10], "...")
        except Exception as e:
            print("get_feature_names_out error:", e)
    else:
        print("⚠️ pre is not ColumnTransformer")
else:
    print("⚠️ Not a sklearn Pipeline")
