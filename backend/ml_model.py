import joblib

model = joblib.load("model.pkl")

def predict_failure(temp, vibration, rpm):
    pred = model.predict([[temp, vibration, rpm]])[0]
    return "High" if pred == 1 else "Low"