"""
Train SVM on UCI Parkinson's dataset features.
Run this once to generate svm_model.pkl
"""
import numpy as np
import pickle
from sklearn.svm import SVC
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline

# UCI Parkinson's dataset - key features we extract:
# jitter, shimmer, HNR, F0, MFCC (13)
# Total: 17 features

# Synthetic training data based on UCI Parkinson's statistics
# Healthy: lower jitter/shimmer, higher HNR, stable F0
# Parkinson's: higher jitter/shimmer, lower HNR, unstable F0

np.random.seed(42)

def generate_samples(n, parkinsons=False):
    if parkinsons:
        jitter = np.random.normal(0.006, 0.002, n).clip(0.001, 0.03)
        shimmer = np.random.normal(0.045, 0.015, n).clip(0.005, 0.15)
        hnr = np.random.normal(16, 4, n).clip(5, 28)
        f0 = np.random.normal(145, 30, n).clip(80, 260)
        mfcc = np.random.normal(-5, 20, (n, 13))
    else:
        jitter = np.random.normal(0.002, 0.001, n).clip(0.0001, 0.008)
        shimmer = np.random.normal(0.015, 0.005, n).clip(0.001, 0.04)
        hnr = np.random.normal(24, 3, n).clip(15, 35)
        f0 = np.random.normal(175, 20, n).clip(100, 280)
        mfcc = np.random.normal(0, 15, (n, 13))

    features = np.column_stack([jitter, shimmer, hnr, f0, mfcc])
    return features

X_healthy = generate_samples(100, parkinsons=False)
X_parkinsons = generate_samples(100, parkinsons=True)

X = np.vstack([X_healthy, X_parkinsons])
y = np.array([0] * 100 + [1] * 100)

model = Pipeline([
    ('scaler', StandardScaler()),
    ('svm', SVC(kernel='rbf', C=10, gamma='scale', probability=True, random_state=42))
])
model.fit(X, y)

with open('/home/claude/vprd/backend/model/svm_model.pkl', 'wb') as f:
    pickle.dump(model, f)

print("Model trained and saved!")
# Quick test
sample = generate_samples(5, parkinsons=True)
probs = model.predict_proba(sample)
print("Parkinson test predictions (prob of PD):", probs[:, 1].round(2))

sample2 = generate_samples(5, parkinsons=False)
probs2 = model.predict_proba(sample2)
print("Healthy test predictions (prob of PD):", probs2[:, 1].round(2))
