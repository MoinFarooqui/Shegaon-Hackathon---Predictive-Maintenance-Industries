import Sidebar from "../components/Sidebar";
import { motion, AnimatePresence } from "framer-motion";
import { BarChart3, Activity, Thermometer, Loader2, WifiOff, RefreshCcw, Zap } from "lucide-react";
import { useState, useEffect, useCallback } from "react";

const API_BASE = "http://localhost:8000";

// ─── Sparkline ────────────────────────────────────────────────────────────────
const Sparkline = ({ data, color }) => {
  const w = 100, h = 30;
  const max = Math.max(...data), min = Math.min(...data);
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / (max - min + 1)) * h;
    return `${x},${y}`;
  }).join(" ");
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="overflow-visible">
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

// ─── Skeleton ─────────────────────────────────────────────────────────────────
const Skeleton = ({ className }) => (
  <div className={`animate-pulse bg-slate-100 rounded-xl ${className}`} />
);

// ─── Status config ────────────────────────────────────────────────────────────
const statusStyle = {
  ok: { color: "#059669", bg: "bg-emerald-50", border: "border-emerald-200", label: "NOMINAL" },
  warning: { color: "#d97706", bg: "bg-amber-50", border: "border-amber-200", label: "WARNING" },
  critical: { color: "#dc2626", bg: "bg-red-50", border: "border-red-200", label: "CRITICAL" },
};

// Map ML risk → status key
const riskToStatus = (risk) => {
  if (risk === "High") return "critical";
  if (risk === "Medium") return "warning";
  return "ok";
};

// Health score from sensor values (0–100)
const calcHealth = (temp, vibration, rpm, failure) => {
  if (failure === 1) return Math.floor(20 + Math.random() * 20);
  let score = 100;
  if (temp > 70) score -= 20;
  else if (temp > 55) score -= 10;
  if (vibration > 2) score -= 25;
  else if (vibration > 1) score -= 12;
  if (rpm > 2500) score -= 15;
  return Math.max(score, 10);
};

// ─── Analytics ────────────────────────────────────────────────────────────────
const Analytics = () => {
  const [rows, setRows] = useState([]);   // final merged rows with live jitter
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [lastRefresh, setLastRefresh] = useState(null);
  const [filter, setFilter] = useState("all"); // all | critical | warning | ok

  // ── Fetch machines then analyze each ────────────────────────────────────────
  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    setRows([]);
    setProgress(0);

    try {
      const mRes = await fetch(`${API_BASE}/machines`);
      if (!mRes.ok) throw new Error(`/machines HTTP ${mRes.status}`);
      const { machines } = await mRes.json();

      const analyzed = [];
      for (let i = 0; i < machines.length; i++) {
        const machine = machines[i];
        try {
          const aRes = await fetch(`${API_BASE}/analyze`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              log: machine.log,
              temp: machine.temp,
              vibration: machine.vibration,
              rpm: machine.rpm,
            }),
          });
          if (!aRes.ok) throw new Error(`HTTP ${aRes.status}`);
          const resp = await aRes.json();

          const health = calcHealth(machine.temp, machine.vibration, machine.rpm, machine.failure_within_24h);
          analyzed.push({
            machine_id: machine.machine_id,
            machine_type: machine.machine_type,
            temp: machine.temp,
            vibration: machine.vibration,
            rpm: machine.rpm,
            health,
            status: riskToStatus(resp.machine_status),
            risk: resp.machine_status,
            rule_based: resp.rule_based,
            ml_pred: resp.ml_prediction,
            issue: resp.issue,
            action: resp.recommended_action,
            hours_since: machine.hours_since_maintenance,
            operating: machine.operating_mode,
            // sparkline history
            history: Array.from({ length: 10 }, () =>
              Math.floor(health + (Math.random() - 0.5) * 12)
            ),
          });
        } catch {
          analyzed.push({
            machine_id: machine.machine_id,
            machine_type: machine.machine_type,
            temp: machine.temp, vibration: machine.vibration, rpm: machine.rpm,
            health: 50, status: "ok", risk: "Low", rule_based: "Low", ml_pred: "Low",
            issue: "Analysis failed", action: "Retry", hours_since: 0, operating: "—",
            history: Array.from({ length: 10 }, () => 50),
          });
        }
        setProgress(Math.round(((i + 1) / machines.length) * 100));
        setRows([...analyzed]);
      }
      setLastRefresh(new Date());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // ── Live jitter every 2.5s ───────────────────────────────────────────────
  useEffect(() => {
    if (rows.length === 0) return;
    const interval = setInterval(() => {
      setRows(prev => prev.map(m => ({
        ...m,
        temp: +(m.temp + (Math.random() - 0.5) * 1.5).toFixed(1),
        vibration: +(m.vibration + (Math.random() - 0.5) * 0.05).toFixed(2),
        history: [...m.history.slice(1), Math.floor(m.health + (Math.random() - 0.5) * 10)],
      })));
    }, 2500);
    return () => clearInterval(interval);
  }, [rows.length]);

  // ── Derived stats ────────────────────────────────────────────────────────
  const avgTemp = rows.length ? (rows.reduce((s, r) => s + r.temp, 0) / rows.length).toFixed(1) : "—";
  const avgVibr = rows.length ? (rows.reduce((s, r) => s + r.vibration, 0) / rows.length).toFixed(2) : "—";
  const avgHealth = rows.length ? Math.round(rows.reduce((s, r) => s + r.health, 0) / rows.length) : 0;
  const critCount = rows.filter(r => r.status === "critical").length;
  const warnCount = rows.filter(r => r.status === "warning").length;

  const filtered = filter === "all" ? rows : rows.filter(r => r.status === filter);

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />

      <div className="flex-1 p-8 space-y-6 overflow-y-auto w-full max-w-[1400px] mx-auto">

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div>
            <span className="text-xs font-bold text-cyan-500 tracking-widest px-2 py-1 bg-cyan-50 rounded-md border border-cyan-100 mb-2 inline-block">
              MODULE :: SENSORS
            </span>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight">
              MACHINE <span className="text-cyan-600">ANALYTICS</span>
            </h1>
            <p className="text-sm font-medium text-slate-500 mt-2">
              {rows.length > 0
                ? `${rows.length} machines · ${critCount} critical · ${warnCount} warning`
                : "Deep telemetry streams, historical trends, and health scores"}
              {lastRefresh && (
                <span className="text-slate-400 text-[11px] ml-2">
                  · Updated {lastRefresh.toLocaleTimeString()}
                </span>
              )}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Status pill */}
            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="flex flex-col items-end gap-1.5">
                  <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 text-xs font-bold">
                    <Loader2 size={13} className="animate-spin" />
                    ANALYZING {progress}%
                  </div>
                  <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div className="h-full bg-blue-500 rounded-full"
                      animate={{ width: `${progress}%` }} transition={{ duration: 0.3 }} />
                  </div>
                </motion.div>
              ) : error ? (
                <motion.div key="err" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-bold">
                  <WifiOff size={13} /> API OFFLINE
                </motion.div>
              ) : (
                <motion.div key="ok" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-50 border border-cyan-200 text-cyan-700 text-xs font-bold">
                  <Activity size={13} className="animate-pulse" /> LIVE · {rows.length} MACHINES
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={fetchAll} disabled={loading}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-50 border border-cyan-200 shadow-sm cursor-pointer disabled:opacity-50"
            >
              <RefreshCcw size={15} className={`text-cyan-600 ${loading ? "animate-spin" : ""}`} />
              <span className="text-[11px] font-bold text-cyan-700 tracking-widest">REFRESH</span>
            </motion.button>
          </div>
        </div>

        {/* ── Error Banner ─────────────────────────────────────────────────── */}
        <AnimatePresence>
          {error && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="flex items-center gap-3 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-medium">
              <WifiOff size={16} />
              <span>Cannot reach <code className="bg-red-100 px-1 rounded font-mono">{API_BASE}</code> — make sure FastAPI is running.</span>
              <button onClick={fetchAll} className="ml-auto text-xs font-bold underline">Retry</button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Stats Row ────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-4 gap-6">
          {[
            {
              label: "FLEET HEALTH AVG",
              value: rows.length === 0 ? "—" : `${avgHealth}%`,
              color: avgHealth > 70 ? "text-cyan-600" : avgHealth > 50 ? "text-amber-500" : "text-red-500",
              bg: "bg-cyan-50", icon: Activity,
            },
            {
              label: "AVG TEMPERATURE",
              value: rows.length === 0 ? "—" : `${avgTemp}°C`,
              color: "text-red-500", bg: "bg-red-50", icon: Thermometer,
            },
            {
              label: "AVG VIBRATION",
              value: rows.length === 0 ? "—" : `${avgVibr} mm/s`,
              color: "text-amber-500", bg: "bg-amber-50", icon: BarChart3,
            },
            {
              label: "CRITICAL MACHINES",
              value: rows.length === 0 ? "—" : String(critCount),
              color: critCount > 0 ? "text-red-600" : "text-emerald-600",
              bg: critCount > 0 ? "bg-red-50" : "bg-emerald-50", icon: Zap,
            },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.08 }}
              whileHover={{ y: -4 }}
              className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-3">
                <p className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">{s.label}</p>
                <div className={`p-2 rounded-lg ${s.bg}`}>
                  <s.icon size={16} className={s.color} />
                </div>
              </div>
              {rows.length === 0
                ? <div className="h-8 w-24 bg-slate-100 rounded animate-pulse" />
                : <p className={`text-3xl font-black ${s.color}`}>{s.value}</p>
              }
            </motion.div>
          ))}
        </div>

        {/* ── Telemetry Table ──────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm overflow-hidden"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-widest">
              Realtime Telemetry Stream
              {loading && rows.length > 0 && (
                <span className="ml-3 text-[10px] text-blue-500 font-bold normal-case">
                  · updating…
                </span>
              )}
            </h2>

            {/* Filter tabs */}
            <div className="flex gap-2">
              {[
                { key: "all", label: `All (${rows.length})` },
                { key: "critical", label: `Critical (${critCount})` },
                { key: "warning", label: `Warning (${warnCount})` },
                { key: "ok", label: "Nominal" },
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setFilter(tab.key)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${filter === tab.key
                      ? "bg-slate-800 text-white shadow"
                      : "bg-slate-50 text-slate-500 border border-slate-200 hover:bg-slate-100"
                    }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100">
                  {["Device", "Type", "Status", "Temp", "Vibration", "RPM", "Health Score", "Maintenance (h)", "Mode"].map(h => (
                    <th key={h} className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.length === 0
                  ? Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="border-b border-slate-50">
                      {Array.from({ length: 9 }).map((_, j) => (
                        <td key={j} className="px-4 py-4">
                          <Skeleton className="h-5 w-full" />
                        </td>
                      ))}
                    </tr>
                  ))
                  : filtered.map((m, i) => {
                    const st = statusStyle[m.status];
                    const healthColor = m.health > 80 ? "#10b981" : m.health > 60 ? "#f59e0b" : "#ef4444";
                    const rowBg = m.status === "critical" ? "bg-red-50/40" : m.status === "warning" ? "bg-amber-50/40" : "";
                    return (
                      <motion.tr
                        key={m.machine_id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.02 * i }}
                        className={`border-b last:border-0 border-slate-50 hover:bg-slate-50/80 transition-colors group cursor-pointer ${rowBg}`}
                      >
                        {/* Device ID */}
                        <td className="px-4 py-4">
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-cyan-600 font-mono">ID-{m.machine_id}</span>
                          </div>
                        </td>

                        {/* Type */}
                        <td className="px-4 py-4">
                          <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                            {m.machine_type}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="px-4 py-4">
                          <span
                            className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold border ${st.bg} ${st.border}`}
                            style={{ color: st.color, letterSpacing: "1px" }}
                          >
                            {st.label}
                          </span>
                        </td>

                        {/* Temp */}
                        <td className="px-4 py-4">
                          <span className={`text-sm font-bold font-mono ${m.temp > 70 ? "text-red-600 bg-red-50 px-2 py-0.5 rounded" :
                              m.temp > 55 ? "text-amber-600" : "text-slate-600"
                            }`}>
                            {m.temp.toFixed(1)}°C
                          </span>
                        </td>

                        {/* Vibration */}
                        <td className="px-4 py-4">
                          <span className={`text-sm font-bold font-mono ${m.vibration > 2 ? "text-red-600 bg-red-50 px-2 py-0.5 rounded" :
                              m.vibration > 1 ? "text-amber-600 bg-amber-50 px-2 py-0.5 rounded" :
                                "text-slate-600"
                            }`}>
                            {m.vibration.toFixed(2)} mm/s
                          </span>
                        </td>

                        {/* RPM */}
                        <td className="px-4 py-4">
                          <span className={`text-sm font-bold font-mono ${m.rpm > 2000 ? "text-purple-600 bg-purple-50 px-2 py-0.5 rounded" : "text-slate-600"
                            }`}>
                            {m.rpm.toFixed(0)}
                          </span>
                        </td>

                        {/* Health Bar */}
                        <td className="px-4 py-4 w-44">
                          <div className="flex items-center gap-3">
                            <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                              <motion.div
                                className="h-full rounded-full"
                                animate={{ width: `${m.health}%` }}
                                transition={{ duration: 1 }}
                                style={{ backgroundColor: healthColor }}
                              />
                            </div>
                            <span className="text-xs font-bold w-8 tabular-nums" style={{ color: healthColor }}>
                              {m.health}%
                            </span>
                          </div>
                        </td>

                        {/* Hours since maintenance */}
                        <td className="px-4 py-4">
                          <span className={`text-xs font-mono font-bold ${m.hours_since > 200 ? "text-red-500" :
                              m.hours_since > 100 ? "text-amber-500" : "text-slate-500"
                            }`}>
                            {m.hours_since.toFixed(0)}h
                          </span>
                        </td>

                        {/* Operating mode */}
                        <td className="px-4 py-4">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${m.operating === "normal"
                              ? "bg-blue-50 text-blue-600 border border-blue-200"
                              : "bg-slate-100 text-slate-500 border border-slate-200"
                            }`}>
                            {m.operating}
                          </span>
                        </td>
                      </motion.tr>
                    );
                  })
                }
              </tbody>
            </table>

            {/* Empty state */}
            {!loading && filtered.length === 0 && rows.length > 0 && (
              <div className="text-center py-12 text-slate-400">
                <Activity size={32} className="mx-auto mb-3 opacity-30" />
                <p className="text-sm font-bold">No machines match this filter</p>
              </div>
            )}
          </div>
        </motion.div>

      </div>
    </div>
  );
};

export default Analytics;