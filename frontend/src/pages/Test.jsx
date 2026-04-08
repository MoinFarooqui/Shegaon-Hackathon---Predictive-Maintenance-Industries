import { useState } from "react";

const API_URL = "http://localhost:8000";

const DEFAULT_FORM = {
    log: "",
    temp: "",
    vibration: "",
    rpm: "",
};

const RISK_STYLES = {
    High: "bg-red-50 text-red-600 border-red-200",
    Medium: "bg-yellow-50 text-yellow-600 border-yellow-200",
    Low: "bg-green-50 text-green-600 border-green-200",
};

function Badge({ level }) {
    return (
        <span
            className={`px-3 py-1 text-xs font-semibold border rounded-md ${RISK_STYLES[level] || RISK_STYLES.Low}`}
        >
            {level.toUpperCase()}
        </span>
    );
}

function Input({ label, value, onChange, placeholder, textarea }) {
    return (
        <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500 uppercase tracking-wide">
                {label}
            </label>

            {textarea ? (
                <textarea
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    rows={3}
                    className="bg-white border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
            ) : (
                <input
                    type="number"
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    className="bg-white border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
            )}
        </div>
    );
}

export default function Test() {
    const [form, setForm] = useState(DEFAULT_FORM);
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleChange = (field) => (e) =>
        setForm((prev) => ({ ...prev, [field]: e.target.value }));

    const handleSubmit = async () => {
        const { log, temp, vibration, rpm } = form;

        if (!log || temp === "" || vibration === "" || rpm === "") {
            setError("All fields are required.");
            return;
        }

        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const res = await fetch(`${API_URL}/analyze`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    log,
                    temp: parseFloat(temp),
                    vibration: parseFloat(vibration),
                    rpm: parseFloat(rpm),
                }),
            });

            const data = await res.json();
            setResult(data);
        } catch (err) {
            setError("Failed to connect to server.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 text-gray-800">

            {/* Header */}
            <header className="bg-white border-b border-gray-200">
                <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
                    <h1 className="text-lg font-bold tracking-wide text-gray-800">
                        MachineGuard
                    </h1>
                    <span className="text-xs text-green-600 font-medium">
                        ● LIVE
                    </span>
                </div>
            </header>

            {/* Main */}
            <main className="max-w-6xl mx-auto p-6 grid md:grid-cols-2 gap-6">

                {/* Form Card */}
                <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                    <h2 className="text-sm font-semibold text-gray-500 mb-4">
                        SENSOR INPUT
                    </h2>

                    <Input
                        label="Machine Log"
                        value={form.log}
                        onChange={handleChange("log")}
                        placeholder="Motor shows abnormal vibration..."
                        textarea
                    />

                    <div className="grid grid-cols-3 gap-3 mt-4">
                        <Input
                            label="Temp (°C)"
                            value={form.temp}
                            onChange={handleChange("temp")}
                            placeholder="320"
                        />
                        <Input
                            label="Vibration (g)"
                            value={form.vibration}
                            onChange={handleChange("vibration")}
                            placeholder="0.9"
                        />
                        <Input
                            label="RPM"
                            value={form.rpm}
                            onChange={handleChange("rpm")}
                            placeholder="3500"
                        />
                    </div>

                    {error && (
                        <div className="mt-4 text-sm text-red-600 bg-red-50 border border-red-200 p-2 rounded">
                            {error}
                        </div>
                    )}

                    <div className="flex gap-3 mt-6">
                        <button
                            onClick={handleSubmit}
                            className="flex-1 bg-amber-500 text-white font-medium py-2 rounded-md hover:bg-amber-600 transition"
                        >
                            {loading ? "Analyzing..." : "Run Analysis"}
                        </button>

                        <button
                            onClick={() => {
                                setForm(DEFAULT_FORM);
                                setResult(null);
                            }}
                            className="border border-gray-300 px-4 rounded-md hover:bg-gray-100"
                        >
                            Reset
                        </button>
                    </div>
                </div>

                {/* Result Card */}
                <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                    <h2 className="text-sm font-semibold text-gray-500 mb-4">
                        ANALYSIS RESULT
                    </h2>

                    {!result && !loading && (
                        <p className="text-gray-400 text-sm text-center py-20">
                            Submit data to view results
                        </p>
                    )}

                    {loading && (
                        <p className="text-center text-gray-400 py-20">
                            Running ML analysis...
                        </p>
                    )}

                    {result && (
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <Badge level={result.machine_status} />
                                <span className="text-sm text-gray-500">
                                    {result.recommended_action}
                                </span>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="p-3 border border-gray-200 rounded">
                                    <p className="text-xs text-gray-500">Rule-Based</p>
                                    <Badge level={result.rule_based} />
                                </div>

                                <div className="p-3 border border-gray-200 rounded">
                                    <p className="text-xs text-gray-500">ML Prediction</p>
                                    <Badge level={result.ml_prediction} />
                                </div>
                            </div>

                            <div className="p-3 border border-gray-200 rounded">
                                <p className="text-xs text-gray-500">Detected Issue</p>
                                <p className="text-sm">{result.issue}</p>
                            </div>

                            <div>
                                <p className="text-xs text-gray-500 mb-1">
                                    Confidence ({Math.round(result.confidence * 100)}%)
                                </p>
                                <div className="w-full bg-gray-200 h-2 rounded">
                                    <div
                                        className="bg-amber-500 h-2 rounded"
                                        style={{ width: `${result.confidence * 100}%` }}
                                    />
                                </div>
                            </div>

                            <div className="bg-gray-50 border border-gray-200 p-4 rounded">
                                <p className="text-xs text-amber-600 mb-2">
                                    AI Explanation
                                </p>
                                <p className="text-sm text-gray-700">
                                    {result.explanation}
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            {/* Footer */}
            <footer className="text-center text-xs text-gray-400 py-4 border-t border-gray-200">
                MachineGuard v1.0 · FastAPI + RandomForest
            </footer>
        </div>
    );
}