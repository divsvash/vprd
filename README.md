# 🎙 Voice Parkinson Risk Detector (VPRD)

Analyzes voice biomarkers (jitter, shimmer, HNR, F0, MFCC) from a sustained "aaa" vowel recording to assess Parkinson's disease risk using a trained SVM model.

---

## 🚀 Quick Start

### 1. Backend

```bash
cd vprd/backend

# Install dependencies
pip install -r ../requirements.txt

# (Optional) Retrain the model
python model/train_model.py

# Start the API server
uvicorn main:app --reload --port 8000
```

API runs at: http://localhost:8000  
Swagger docs: http://localhost:8000/docs

### 2. Frontend

```bash
cd vprd/frontend
npm install
npm run dev
```

App runs at: http://localhost:5173

---

## 🔌 API

### `POST /predict`

**Input:** `multipart/form-data` with field `file` (.wav, max 5MB, min 3s)

**Output:**
```json
{
  "risk_score": 0.72,
  "label": "High",
  "reasons": [
    "Elevated pitch instability (jitter: 0.0061) — indicates irregular vocal fold vibration",
    "Low harmonic-to-noise ratio (15.2 dB) — breathy voice quality detected"
  ],
  "features": {
    "jitter": 0.006123,
    "shimmer": 0.034567,
    "hnr": 15.2,
    "f0": 143.8,
    "mfcc": [...]
  }
}
```

---

## 🧠 Model

- **Algorithm:** SVM with RBF kernel (scikit-learn Pipeline with StandardScaler)
- **Features:** jitter, shimmer, HNR, F0, 13 MFCCs (17 total)
- **Training data:** Synthetic dataset based on UCI Parkinson's statistics
- **Labels:** Low (<35%), Medium (35–65%), High (>65%)

---

## ⚕ Disclaimer

This tool is for **research and educational purposes only**. It is not a certified medical diagnostic device. Always consult a qualified neurologist for clinical assessment.
