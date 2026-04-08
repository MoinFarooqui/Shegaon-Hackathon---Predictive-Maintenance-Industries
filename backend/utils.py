def analyze_log(log):
    log = log.lower()

    if "vibration" in log and "temperature" in log:
        return "High", "Mechanical stress detected"
    elif "leakage" in log:
        return "Medium", "Oil leakage issue"
    elif "temperature" in log:
        return "Medium", "Overheating risk"
    else:
        return "Low", "Normal condition"