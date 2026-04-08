import { useState } from "react";

const API = "http://127.0.0.1:8000";

function Input() {
    const [file, setFile] = useState(null);
    const [drag, setDrag] = useState(false);
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [preview, setPreview] = useState([]);

    const handleFile = (f) => {
        if (!f || !f.name.endsWith(".csv")) {
            setMessage("Only CSV files allowed ❌");
            return;
        }

        setFile(f);
        setMessage("");

        const reader = new FileReader();
        reader.onload = (e) => {
            const rows = e.target.result.split("\n").slice(0, 5);
            setPreview(rows);
        };
        reader.readAsText(f);
    };

    const uploadFile = async () => {
        if (!file) {
            setMessage("Please select a file ⚠️");
            return;
        }

        const formData = new FormData();
        formData.append("file", file);

        setLoading(true);

        try {
            const res = await fetch(`${API}/upload`, {
                method: "POST",
                body: formData,
            });

            await res.json();
            setMessage("File uploaded successfully ✅");
        } catch (err) {
            setMessage("Upload failed ❌");
        }

        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
            <div className="w-full max-w-xl bg-white shadow-md rounded-xl p-6">
                <h1 className="text-2xl font-semibold text-gray-800 text-center mb-6">
                    Upload Dataset
                </h1>

                {/* DROPZONE */}
                <div
                    onDragOver={(e) => {
                        e.preventDefault();
                        setDrag(true);
                    }}
                    onDragLeave={() => setDrag(false)}
                    onDrop={(e) => {
                        e.preventDefault();
                        setDrag(false);
                        handleFile(e.dataTransfer.files[0]);
                    }}
                    className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition
            ${drag ? "border-indigo-500 bg-indigo-50" : "border-gray-300 bg-gray-50"}
          `}
                >
                    <p className="text-gray-600">Drag & Drop CSV file here</p>
                    <p className="text-gray-400 text-sm mt-1">or</p>

                    <input
                        type="file"
                        accept=".csv"
                        onChange={(e) => handleFile(e.target.files[0])}
                        className="mt-3 text-sm"
                    />
                </div>

                {/* FILE NAME */}
                {file && (
                    <p className="mt-4 text-sm text-gray-700">
                        📄 {file.name}
                    </p>
                )}

                {/* BUTTON */}
                <button
                    onClick={uploadFile}
                    disabled={loading}
                    className="mt-5 w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 transition"
                >
                    {loading ? "Uploading..." : "Upload Dataset"}
                </button>

                {/* MESSAGE */}
                {message && (
                    <p className="mt-3 text-center text-sm text-gray-700">
                        {message}
                    </p>
                )}

                {/* PREVIEW */}
                {preview.length > 0 && (
                    <div className="mt-6 border rounded-md p-3 bg-gray-50">
                        <h3 className="text-sm font-semibold mb-2">Preview</h3>
                        {preview.map((row, i) => (
                            <p key={i} className="text-xs text-gray-600">
                                {row}
                            </p>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default Input;