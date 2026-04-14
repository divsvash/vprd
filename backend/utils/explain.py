"""Rule-based explainability for Parkinson's voice biomarkers."""

# Thresholds based on UCI Parkinson's dataset analysis
JITTER_THRESHOLD = 0.0045
SHIMMER_THRESHOLD = 0.030
HNR_LOW_THRESHOLD = 20.0
F0_LOW_THRESHOLD = 100.0
F0_HIGH_THRESHOLD = 250.0


def generate_reasons(features: dict) -> list[str]:
    reasons = []

    if features["jitter"] > JITTER_THRESHOLD:
        reasons.append(
            f"Elevated pitch instability (jitter: {features['jitter']:.4f}) — "
            "indicates irregular vocal fold vibration"
        )

    if features["shimmer"] > SHIMMER_THRESHOLD:
        reasons.append(
            f"High amplitude variation (shimmer: {features['shimmer']:.4f}) — "
            "suggests inconsistent vocal fold closure"
        )

    if features["hnr"] < HNR_LOW_THRESHOLD:
        reasons.append(
            f"Low harmonic-to-noise ratio ({features['hnr']:.1f} dB) — "
            "breathy voice quality detected"
        )

    if features["f0"] < F0_LOW_THRESHOLD or features["f0"] > F0_HIGH_THRESHOLD:
        reasons.append(
            f"Atypical fundamental frequency ({features['f0']:.1f} Hz) — "
            "outside normal speech range"
        )

    # Fallback for borderline cases
    if not reasons:
        reasons.append("Voice pattern within normal parameters")

    return reasons[:3]  # Return max 3 reasons
