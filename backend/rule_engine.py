def rule_analysis(log):
    log = log.lower()

    if "vibration" in log and "temperature" in log:
        return "High", "Critical combined issue"
    elif "vibration" in log:
        return "Medium", "Vibration issue"
    elif "temperature" in log:
        return "Medium", "Overheating"
    else:
        return "Low", "Normal"