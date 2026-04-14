from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.predict import router as predict_router

app = FastAPI(
    title="Voice Parkinson Risk Detector API",
    description="Analyzes voice biomarkers to assess Parkinson's disease risk",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(predict_router)


@app.get("/health")
def health():
    return {"status": "ok", "service": "VPRD Backend"}
