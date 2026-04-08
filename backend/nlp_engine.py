from openai import OpenAI
import os
from dotenv import load_dotenv

load_dotenv()

client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=os.getenv("OPENROUTER_API_KEY"),
)


# ── LLM 1: Diagnosis explainer (gemma-3n) ────────────────────────────────────
def generate_explanation(log: str, risk: str, temp: float = 0, vibration: float = 0, rpm: float = 0) -> str:
    """
    Explains what is wrong with the machine in plain technical language.
    Uses sensor values + risk level for a richer, specific diagnosis.
    """
    try:
        prompt = f"""You are an industrial maintenance expert.

Machine sensor reading:
- Log message: {log}
- Temperature: {temp}°C
- Vibration: {vibration} mm/s
- RPM: {rpm}
- Risk level: {risk}

In 2-3 sentences, explain what is likely wrong with this machine and why it is a {risk} risk.
Be specific, technical, and concise. Do not use bullet points."""

        completion = client.chat.completions.create(
            model="google/gemma-3n-e2b-it:free",
            messages=[
                {"role": "system", "content": "You are a senior industrial maintenance engineer. Give precise, technical diagnoses."},
                {"role": "user",   "content": prompt}
            ],
            max_tokens=200,
        )
        result = completion.choices[0].message.content.strip()
        return result if result else _fallback_explanation(log, risk)

    except Exception as e:
        return _fallback_explanation(log, risk)


def _fallback_explanation(log: str, risk: str) -> str:
    if risk == "High":
        return f"Critical failure indicators detected: {log}. Immediate shutdown and inspection recommended to prevent permanent damage."
    elif risk == "Medium":
        return f"Abnormal operating conditions detected: {log}. System is functional but degraded — schedule maintenance within 48 hours."
    else:
        return f"Machine operating within normal parameters. No immediate action required based on current sensor readings."


# ── LLM 2: Maintenance plan generator (mistral-7b) ───────────────────────────
def generate_maintenance_plan(machine_type: str, risk: str, issue: str, temp: float = 0, vibration: float = 0, rpm: float = 0) -> str:
    """
    Generates a step-by-step maintenance checklist for the machine.
    Uses mistral-7b for structured, actionable output.
    """
    try:
        prompt = f"""You are a maintenance planning expert.

Machine details:
- Type: {machine_type}
- Risk level: {risk}
- Detected issue: {issue}
- Temperature: {temp}°C
- Vibration: {vibration} mm/s
- RPM: {rpm}

Provide exactly 4 maintenance steps for this machine as a numbered list (1. 2. 3. 4.).
Each step should be one clear, actionable sentence.
Do not add any intro or conclusion — just the 4 numbered steps."""

        completion = client.chat.completions.create(
            model="mistralai/mistral-7b-instruct:free",
            messages=[
                {"role": "system", "content": "You are a maintenance planning engineer. Always respond with exactly 4 numbered steps. Nothing else."},
                {"role": "user",   "content": prompt}
            ],
            max_tokens=250,
        )
        result = completion.choices[0].message.content.strip()
        return result if result else _fallback_plan(risk)

    except Exception as e:
        return _fallback_plan(risk)


def _fallback_plan(risk: str) -> str:
    if risk == "High":
        return "1. Immediately shut down the machine and isolate power.\n2. Inspect bearings, seals, and rotating components for damage.\n3. Check and replace lubrication fluid if degraded.\n4. Run a full diagnostic cycle before returning to operation."
    elif risk == "Medium":
        return "1. Reduce machine load to 60% capacity until inspection.\n2. Check vibration dampeners and mounting bolts for looseness.\n3. Inspect sensor connections and recalibrate if needed.\n4. Schedule full preventive maintenance within 48 hours."
    else:
        return "1. Log current sensor readings for baseline comparison.\n2. Verify all safety interlocks are functioning correctly.\n3. Clean external surfaces and check for debris buildup.\n4. Confirm next scheduled maintenance date is within 30 days."