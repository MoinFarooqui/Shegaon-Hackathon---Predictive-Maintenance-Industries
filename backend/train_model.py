import pandas as pd
from sklearn.ensemble import RandomForestClassifier
import joblib

df = pd.read_csv("dataset.csv")

# Drop rows with missing values in required columns
df.dropna(subset=["temperature_motor", "vibration_rms", "rpm", "failure_within_24h"], inplace=True)

# ✅ Correct column names from dataset.csv
X = df[["temperature_motor", "vibration_rms", "rpm"]]
y = df["failure_within_24h"]

model = RandomForestClassifier(n_estimators=100, random_state=42)
model.fit(X, y)

joblib.dump(model, "model.pkl")
print(f"✅ Model trained on {len(df)} rows and saved to model.pkl")