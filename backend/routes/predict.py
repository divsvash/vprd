from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
from services.audio_processing import load_and_preprocess
from services.feature_extraction import extract_features, features_to_vector
from services.inference import predict
from utils.explain import generate_reasons
import traceback

router = APIRouter()

MAX_FILE_SIZE = 5 * 1024 * 1024  # 5 MB


@router.post("/predict")
async def predict_parkinson_risk(file: UploadFile = File(...)):
    # Validate file type
    if not file.filename.lower().endswith(".wav"):
        raise HTTPException(status_code=400, detail="Only .wav files are accepted")

    audio_bytes = await file.read()

    # Validate size
    if len(audio_bytes) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File too large (max 5MB)")

    try:
        # 1. Preprocess
        y, sr = load_and_preprocess(audio_bytes)

        # 2. Extract features
        features = extract_features(y, sr)

        # 3. Predict
        feature_vec = features_to_vector(features)
        result = predict(feature_vec)

        # 4. Explain
        reasons = generate_reasons(features)

        return JSONResponse({
            "risk_score": result["risk_score"],
            "label": result["label"],
            "reasons": reasons,
            "features": features
        })

    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")
