import pickle
import numpy as np
import os

MODEL_PATH = os.path.join(os.path.dirname(__file__), '..', 'model', 'svm_model.pkl')

_model = None

def get_model():
    global _model
    if _model is None:
        with open(MODEL_PATH, 'rb') as f:
            _model = pickle.load(f)
    return _model


def predict(feature_vector: list) -> dict:
    """Run SVM prediction and return risk score + label."""
    model = get_model()
    X = np.array(feature_vector).reshape(1, -1)

    prob = model.predict_proba(X)[0]
    risk_score = float(prob[1])  # probability of Parkinson's

    if risk_score < 0.35:
        label = "Low"
    elif risk_score < 0.65:
        label = "Medium"
    else:
        label = "High"

    return {
        "risk_score": round(risk_score, 4),
        "label": label
    }
