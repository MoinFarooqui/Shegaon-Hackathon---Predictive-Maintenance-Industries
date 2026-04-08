from fastapi import FastAPI
from pydantic import BaseModel
from rule_engine import rule_analysis
from ml_model import predict_failure
from nlp_engine import generate_explanation, generate_maintenance_plan
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import os

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Input schema ──────────────────────────────────────────────────────────────
class InputData(BaseModel):
    log: str
    temp: float
    vibration: float
    rpm: float
    machine_type: str = "Machine"   # optional — used by LLM 2


# ── Helper ────────────────────────────────────────────────────────────────────
def get_final_risk(rule_risk, ml_risk):
    priority = {"Low": 1, "Medium": 2, "High": 3}
    return max(rule_risk, ml_risk, key=lambda x: priority[x])


# ── POST /analyze ─────────────────────────────────────────────────────────────
@app.post("/analyze")
def analyze(data: InputData):
    # Step 1: Rule engine
    rule_risk, rule_reason = rule_analysis(data.log)

    # Step 2: ML model
    ml_risk = predict_failure(data.temp, data.vibration, data.rpm)

    # Step 3: Final risk (highest wins)
    final_risk = get_final_risk(rule_risk, ml_risk)

    # Step 4: LLM 1 — Diagnosis explanation (gemma-3n)
    explanation = generate_explanation(
        log=data.log,
        risk=final_risk,
        temp=data.temp,
        vibration=data.vibration,
        rpm=data.rpm,
    )

    # Step 5: LLM 2 — Maintenance plan (mistral-7b)
    maintenance_plan = generate_maintenance_plan(
        machine_type=data.machine_type,
        risk=final_risk,
        issue=rule_reason,
        temp=data.temp,
        vibration=data.vibration,
        rpm=data.rpm,
    )

    return {
        "machine_status":    final_risk,
        "rule_based":        rule_risk,
        "ml_prediction":     ml_risk,
        "issue":             rule_reason,
        "confidence":        0.85,
        "recommended_action": (
            "Immediate inspection required" if final_risk == "High"
            else "Schedule maintenance soon"  if final_risk == "Medium"
            else "Monitor system"
        ),
        "explanation":       explanation,       # LLM 1 output
        "maintenance_plan":  maintenance_plan,  # LLM 2 output
    }


# ── GET /machines ─────────────────────────────────────────────────────────────
@app.get("/machines")
def get_machines():
    CSV_PATH = os.path.join(os.path.dirname(__file__), "dataset.csv")
    df = pd.read_csv(CSV_PATH)

    df.dropna(subset=["vibration_rms", "temperature_motor", "rpm"], inplace=True)
    df["timestamp"] = pd.to_datetime(df["timestamp"])

    latest = (
        df.sort_values("timestamp")
          .groupby("machine_id")
          .last()
          .reset_index()
    )

    machines = []
    for _, row in latest.iterrows():
        machine_id   = int(row["machine_id"])
        machine_type = str(row["machine_type"])
        temp         = float(row["temperature_motor"])
        vibration    = float(row["vibration_rms"])
        rpm          = float(row["rpm"])

        if temp > 300 and vibration > 0.8:
            log = f"{machine_type} shows high temperature and severe vibration at high RPM"
        elif vibration > 0.8:
            log = f"{machine_type} has abnormal vibration during operation"
        elif temp > 300:
            log = f"{machine_type} temperature rising above safe limit"
        else:
            log = f"{machine_type} operating under normal conditions"

        machines.append({
            "machine_id":              machine_id,
            "machine_type":            machine_type,
            "temp":                    temp,
            "vibration":               vibration,
            "rpm":                     rpm,
            "log":                     log,
            "operating_mode":          str(row.get("operating_mode", "")),
            "hours_since_maintenance": float(row.get("hours_since_maintenance", 0)),
            "failure_within_24h":      int(row.get("failure_within_24h", 0)),
            "estimated_repair_cost":   float(row.get("estimated_repair_cost", 0)),
        })

    return {"machines": machines, "total": len(machines)}