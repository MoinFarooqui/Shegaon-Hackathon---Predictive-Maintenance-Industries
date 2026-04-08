import pandas as pd

df = pd.read_csv("dataset.csv")

logs = []

for _, row in df.iterrows():
    temp = row.get("motor_temperature", 0)
    vibration = row.get("vibration", 0)
    rpm = row.get("rpm", 0)
    machine = row.get("machine_type", "Machine")

    if temp > 300 and vibration > 0.8:
        log = f"{machine} shows high temperature and severe vibration at high RPM"
    elif vibration > 0.8:
        log = f"{machine} has abnormal vibration during operation"
    elif temp > 300:
        log = f"{machine} temperature rising above safe limit"
    else:
        log = f"{machine} operating under normal conditions"

    logs.append(log)

# Save logs
pd.DataFrame({"log": logs}).to_csv("logs.csv", index=False)

print("Logs generated successfully!")