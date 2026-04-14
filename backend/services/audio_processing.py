import numpy as np
import librosa
import io

TARGET_SR = 22050
MIN_DURATION = 3.0
MAX_DURATION = 30.0

def load_and_preprocess(audio_bytes: bytes) -> tuple[np.ndarray, int]:
    """Load, resample, normalize, and trim audio."""
    audio_io = io.BytesIO(audio_bytes)
    y, sr = librosa.load(audio_io, sr=TARGET_SR, mono=True)

    # Validate duration
    duration = len(y) / sr
    if duration < MIN_DURATION:
        raise ValueError(f"Audio too short: {duration:.1f}s (min {MIN_DURATION}s)")
    if duration > MAX_DURATION:
        # Trim to first MAX_DURATION seconds
        y = y[:int(MAX_DURATION * sr)]

    # Normalize amplitude
    max_amp = np.max(np.abs(y))
    if max_amp > 0:
        y = y / max_amp

    # Trim silence
    y, _ = librosa.effects.trim(y, top_db=20)

    if len(y) / sr < MIN_DURATION:
        raise ValueError("Audio has too much silence. Please record a sustained vowel.")

    return y, sr
