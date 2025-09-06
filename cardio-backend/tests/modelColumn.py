import sys, traceback
import joblib
import sklearn
import xgboost

print("PY:", sys.executable)
print("sklearn:", sklearn.__version__)
print("xgboost:", xgboost.__version__)

path = r"d:\AIO-Module03-cardioAI\cardio-backend\app\ml\xgboost_model.pkl"
print("Loading:", path)
model = joblib.load(path)
print("Loaded type:", type(model))

def safe_getattr(obj, name):
    return getattr(obj, name, None)

# 1) Nếu có feature_names_in_
fni = safe_getattr(model, "feature_names_in_")
if fni is not None:
    print("feature_names_in_:", list(fni))

# 2) Nếu là Pipeline → liệt kê steps
from sklearn.pipeline import Pipeline
if isinstance(model, Pipeline):
    print("Pipeline steps:", [n for n, _ in model.steps])
    last_est = model.steps[-1][1]
    fni_last = safe_getattr(last_est, "feature_names_in_")
    if fni_last is not None:
        print("last estimator feature_names_in_:", list(fni_last))

    # Nếu có ColumnTransformer → in feature_names_out
    from sklearn.compose import ColumnTransformer
    for name, step in model.steps:
        if isinstance(step, ColumnTransformer):
            try:
                cols = step.get_feature_names_out()
                print("ColumnTransformer feature_names_out:", list(cols))
            except Exception:
                print("ColumnTransformer has no get_feature_names_out() in this version.")

# 3) Nếu là XGBClassifier wrapper
from xgboost import XGBClassifier
if isinstance(model, XGBClassifier):
    booster = model.get_booster()
    print("Booster feature_names:", booster.feature_names)

# 4) Trường hợp khác: in dir để soi
if not isinstance(model, Pipeline) and fni is None:
    print("Dir(model) sample:", [a for a in dir(model) if a.endswith('_in_') or 'feature' in a][:20])
