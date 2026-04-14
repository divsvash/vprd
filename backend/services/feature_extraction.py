import numpy as np
import librosa

def extract_features(y: np.ndarray, sr: int) -> dict:
    """Extract voice biomarkers relevant to Parkinson's detection."""

    # --- Fundamental Frequency (F0) ---
    f0, voiced_flag, _ = librosa.pyin(
        y, fmin=librosa.note_to_hz('C2'),
        fmax=librosa.note_to_hz('C7'),
        sr=sr
    )
    f0_voiced = f0[voiced_flag] if voiced_flag is not None else f0
    f0_voiced = f0_voiced[~np.isnan(f0_voiced)] if f0_voiced is not None else np.array([])
    f0_mean = float(np.mean(f0_voiced)) if len(f0_voiced) > 0 else 150.0

    # --- Jitter (cycle-to-cycle variation in F0) ---
    if len(f0_voiced) > 1:
        periods = 1.0 / (f0_voiced + 1e-9)
        jitter = float(np.mean(np.abs(np.diff(periods))) / (np.mean(periods) + 1e-9))
    else:
        jitter = 0.005  # default

    # --- Shimmer (cycle-to-cycle variation in amplitude) ---
    frame_length = int(sr * 0.025)
    hop_length = int(sr * 0.010)
    rms = librosa.feature.rms(y=y, frame_length=frame_length, hop_length=hop_length)[0]
    if len(rms) > 1 and np.mean(rms) > 0:
        shimmer = float(np.mean(np.abs(np.diff(rms))) / (np.mean(rms) + 1e-9))
    else:
        shimmer = 0.02

    # --- HNR (Harmonic-to-Noise Ratio) ---
    # Approximate via spectral flatness -> lower flatness = more harmonic
    spec_flatness = librosa.feature.spectral_flatness(y=y, hop_length=hop_length)[0]
    mean_flatness = float(np.mean(spec_flatness))
    # Convert to dB-like HNR: highly harmonic voice → low flatness → high HNR
    hnr = float(-10 * np.log10(mean_flatness + 1e-9))
    hnr = np.clip(hnr, 5.0, 40.0)

    # --- MFCC (13 coefficients) ---
    mfcc = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=13)
    mfcc_mean = mfcc.mean(axis=1).tolist()

    return {
        "jitter": round(jitter, 6),
        "shimmer": round(float(shimmer), 6),
        "hnr": round(float(hnr), 3),
        "f0": round(f0_mean, 3),
        "mfcc": [round(v, 4) for v in mfcc_mean]
    }


def features_to_vector(features: dict) -> list:
    """Flatten features into ML input vector."""
    return [
        features["jitter"],
        features["shimmer"],
        features["hnr"],
        features["f0"],
        *features["mfcc"]
    ]
