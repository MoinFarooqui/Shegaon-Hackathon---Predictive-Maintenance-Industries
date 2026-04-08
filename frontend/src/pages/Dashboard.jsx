import Sidebar from "../components/Sidebar";
import Card from "../components/Card";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import {
  Activity, Cpu, AlertTriangle, Zap,
  Radio, TrendingUp, Bot, RefreshCcw,
  CheckCircle, Loader2, WifiOff, Wrench,
  ChevronDown, ChevronUp
} from "lucide-react";

const API_BASE = "http://localhost:8000";

const BLUE  = "#2563eb";
const SLATE = "#475569";

// ─── Mini bar chart ──────────────────────────────────────────────────────────
const MiniBarChart = ({ data, isHovered }) => {
  const max = Math.max(...data, 1);
  return (
    <div className="flex items-end gap-1.5 h-full px-2">
      {data.map((v, i) => (
        <motion.div
          key={i}
          className="flex-1 rounded-t-sm relative group"
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ delay: i * 0.04, duration: 0.4 }}
          style={{
            height: `${(v / max) * 100}%`,
            background: isHovered ? BLUE : "#cbd5e1",
            transition: "background 0.2s",
          }}
        >
          <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] py-0.5 px-1.5 rounded opacity-0 group-hover:opacity-100 pointer-events-none z-10 whitespace-nowrap">
            {v}
          </div>
        </motion.div>
      ))}
    </div>
  );
};

// ─── Ring gauge ───────────────────────────────────────────────────────────────
const RingGauge = ({ value, max = 100, label }) => {
  const r = 30, circ = 2 * Math.PI * r;
  const safe = Math.min(Math.max(value, 0), max);
  return (
    <div className="flex flex-col items-center gap-1.5 p-2">
      <div className="relative">
        <svg width="72" height="72" viewBox="0 0 72 72">
          <circle cx="36" cy="36" r={r} fill="none" stroke="#e2e8f0" strokeWidth="4" />
          <motion.circle
            cx="36" cy="36" r={r} fill="none" stroke={BLUE} strokeWidth="5"
            strokeLinecap="round" strokeDasharray={circ}
            initial={{ strokeDashoffset: circ }}
            animate={{ strokeDashoffset: circ - (safe / max) * circ }}
            transition={{ duration: 0.9, ease: "easeOut" }}
            style={{ transform: "rotate(-90deg)", transformOrigin: "center" }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-medium text-slate-600">{Math.round(safe)}%</span>
        </div>
      </div>
      <span className="text-[9px] font-medium text-slate-400 tracking-wide uppercase">{label}</span>
    </div>
  );
};

// ─── Risk badge ───────────────────────────────────────────────────────────────
const RiskBadge = ({ risk }) => {
  const cfg = {
    High:   { cls: "bg-red-50 text-red-600 border-red-200",       dot: "#ef4444" },
    Medium: { cls: "bg-amber-50 text-amber-600 border-amber-200", dot: "#f59e0b" },
    Low:    { cls: "bg-slate-50 text-slate-500 border-slate-200", dot: "#94a3b8" },
  }[risk] ?? { cls: "bg-slate-50 text-slate-400 border-slate-200", dot: "#cbd5e1" };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded border text-[10px] font-medium ${cfg.cls}`}>
      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: cfg.dot }} />
      {risk?.toUpperCase() ?? "—"}
    </span>
  );
};

// ─── Skeleton ─────────────────────────────────────────────────────────────────
const Skeleton = ({ className }) => (
  <div className={`animate-pulse bg-slate-100 rounded-xl ${className}`} />
);

// ─── Maintenance steps ────────────────────────────────────────────────────────
const MaintenanceSteps = ({ plan }) => {
  if (!plan) return <p className="text-xs text-slate-400 italic">No plan available</p>;
  const lines = plan.split("\n").filter(l => l.trim().match(/^\d+\./));
  if (lines.length === 0)
    return <p className="text-xs text-slate-500 leading-relaxed">{plan}</p>;
  return (
    <ol className="space-y-2">
      {lines.map((line, i) => (
        <li key={i} className="flex items-start gap-2">
          <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-50 border border-blue-200 text-blue-600 text-[10px] font-semibold flex items-center justify-center mt-0.5">
            {i + 1}
          </span>
          <span className="text-xs text-slate-500 leading-relaxed">
            {line.replace(/^\d+\.\s*/, "")}
          </span>
        </li>
      ))}
    </ol>
  );
};

// ─── Alert card ───────────────────────────────────────────────────────────────
const AlertCard = ({ machine, response, index }) => {
  const [expanded, setExpanded] = useState(false);
  const level = response.machine_status;
  const leftBorder =
    level === "High" ? "#ef4444" : level === "Medium" ? "#f59e0b" : "#94a3b8";

  return (
    <motion.div
      initial={{ opacity: 0, x: -6 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.04 }}
      className="rounded-lg border border-slate-200 bg-white overflow-hidden hover:shadow-sm transition-shadow"
      style={{ borderLeft: `3px solid ${leftBorder}` }}
    >
      <div className="p-3 cursor-pointer" onClick={() => setExpanded(e => !e)}>
        <div className="flex items-center justify-between gap-2 mb-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 border border-slate-200">
              ID-{machine.machine_id}
            </span>
            <span className="text-[9px] text-slate-400">{machine.machine_type}</span>
            <RiskBadge risk={level} />
          </div>
          <div className="flex items-center gap-1">
            {response.maintenance_plan && (
              <span className="text-[9px] font-semibold text-blue-600 bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded">
                PLAN
              </span>
            )}
            {expanded
              ? <ChevronUp size={12} className="text-slate-300" />
              : <ChevronDown size={12} className="text-slate-300" />}
          </div>
        </div>
        <p className="text-xs font-semibold text-slate-700">{response.issue}</p>
        <p className="text-[10px] text-slate-400 mt-0.5">{response.recommended_action}</p>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3 border-t border-slate-100">
              <div className="flex items-center gap-1.5 mt-2 mb-2">
                <Wrench size={10} className="text-blue-400" />
                <span className="text-[9px] font-semibold text-blue-600 uppercase tracking-wider">
                  Maintenance plan · mistral-7b
                </span>
              </div>
              <MaintenanceSteps plan={response.maintenance_plan} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// ─── Status pill ──────────────────────────────────────────────────────────────
const StatusPill = ({ loading, error, count }) => {
  if (loading)
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-100 text-blue-600 text-[11px] font-medium">
        <Loader2 size={11} className="animate-spin" />
        Analyzing…
      </div>
    );
  if (error)
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 border border-slate-200 text-slate-500 text-[11px] font-medium">
        <WifiOff size={11} /> Offline
      </div>
    );
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-500 text-[11px] font-medium">
      <CheckCircle size={11} className="text-blue-500" /> {count} analyzed
    </div>
  );
};

// ─── Dashboard ────────────────────────────────────────────────────────────────
const Dashboard = () => {
  const [isChartHovered, setIsChartHovered] = useState(false);
  const [machines, setMachines] = useState([]);
  const [results, setResults] = useState([]);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingPhase, setLoadingPhase] = useState("");
  const [error, setError] = useState(null);
  const [lastRefresh, setLastRefresh] = useState(null);

  const highCount   = results.filter(r => r.response?.machine_status === "High").length;
  const mediumCount = results.filter(r => r.response?.machine_status === "Medium").length;
  const totalAlerts = highCount + mediumCount;
  const avgConf = results.length
    ? Math.round((results.reduce((s, r) => s + (r.response?.confidence ?? 0), 0) / results.length) * 100)
    : 0;

  const chartData = results.length
    ? results.map(r => ({ High: 20, Medium: 55, Low: 85 }[r.response?.machine_status] ?? 60))
    : Array.from({ length: 14 }, () => Math.floor(35 + Math.random() * 55));

  const avgTempPct = results.length ? Math.min(Math.round(results.reduce((s, r) => s + r.machine.temp, 0) / results.length / 1.5), 100) : 0;
  const avgVibrPct = results.length ? Math.min(Math.round(results.reduce((s, r) => s + r.machine.vibration, 0) / results.length * 33), 100) : 0;
  const avgRpmPct  = results.length ? Math.min(Math.round(results.reduce((s, r) => s + r.machine.rpm, 0) / results.length / 40), 100) : 0;

  const priority = { High: 3, Medium: 2, Low: 1 };
  const topResult = [...results].sort(
    (a, b) => (priority[b.response?.machine_status] ?? 0) - (priority[a.response?.machine_status] ?? 0)
  )[0];

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    setResults([]);
    setProgress(0);
    try {
      setLoadingPhase("machines");
      const mRes = await fetch(`${API_BASE}/machines`);
      if (!mRes.ok) throw new Error(`/machines HTTP ${mRes.status}`);
      const { machines: machineList } = await mRes.json();
      setMachines(machineList);
      setLoadingPhase("analyzing");
      const analyzed = [];
      for (let i = 0; i < machineList.length; i++) {
        const machine = machineList[i];
        try {
          const aRes = await fetch(`${API_BASE}/analyze`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              log: machine.log, temp: machine.temp,
              vibration: machine.vibration, rpm: machine.rpm,
              machine_type: machine.machine_type,
            }),
          });
          if (!aRes.ok) throw new Error(`HTTP ${aRes.status}`);
          const response = await aRes.json();
          analyzed.push({ machine, response });
        } catch {
          analyzed.push({
            machine,
            response: {
              machine_status: "Low", rule_based: "Low", ml_prediction: "Low",
              issue: "Analysis failed", confidence: 0,
              recommended_action: "Retry analysis",
              explanation: "Could not reach API for this machine.",
              maintenance_plan: null,
            },
          });
        }
        setProgress(Math.round(((i + 1) / machineList.length) * 100));
        setResults([...analyzed]);
      }
      setLastRefresh(new Date());
    } catch (err) {
      setError(err.message ?? "Failed to connect");
    } finally {
      setLoading(false);
      setLoadingPhase("");
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}
      className="flex min-h-screen bg-slate-50"
    >
      <Sidebar />

      <div className="flex-1 p-6 space-y-5 overflow-y-auto w-full max-w-[1600px] mx-auto">

        {/* ── Header ── */}
        <div className="flex items-center justify-between bg-white border border-slate-200 rounded-2xl px-6 py-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[9px] font-semibold text-blue-600 tracking-widest px-2 py-0.5 bg-blue-50 rounded border border-blue-100 uppercase">
                Core Module
              </span>
              <span className="text-[9px] font-semibold text-slate-500 tracking-widest px-2 py-0.5 bg-slate-50 rounded border border-slate-200 uppercase">
                2 LLMs Active
              </span>
            </div>
            <h1 className="text-xl font-semibold text-slate-800 tracking-tight">
              Predictive Maintenance{" "}
              <span className="text-blue-600">Hub</span>
            </h1>
            <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1.5">
              <RefreshCcw size={10} />
              {machines.length > 0 ? `${machines.length} machines · Rule + ML + 2 LLMs` : "Loading…"}
              {lastRefresh && (
                <span className="text-slate-300">· {lastRefresh.toLocaleTimeString()}</span>
              )}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {loading && loadingPhase === "analyzing" && (
              <div className="flex flex-col items-end gap-1">
                <span className="text-[10px] text-blue-500 font-medium">{progress}%</span>
                <div className="w-28 h-1 bg-slate-100 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-blue-500 rounded-full"
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.2 }}
                  />
                </div>
              </div>
            )}

            <StatusPill loading={loading} error={error} count={results.length} />

            <motion.button
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
              onClick={fetchAll} disabled={loading}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 transition-colors disabled:opacity-40 cursor-pointer"
            >
              <Radio size={14} className="text-white" />
              <span className="text-xs font-medium text-white">Re-analyze</span>
            </motion.button>
          </div>
        </div>

        {/* ── Error banner ── */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 text-xs"
            >
              <WifiOff size={13} className="text-slate-400" />
              <span>
                Cannot reach{" "}
                <code className="bg-slate-100 px-1 rounded text-slate-700">http://localhost:8000</code>{" "}
                — start FastAPI first.
              </span>
              <button onClick={fetchAll} className="ml-auto text-[11px] font-medium text-blue-600 hover:underline">
                Retry
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Stat cards ── */}
        <div className="grid grid-cols-4 gap-4">
          <Card title="Total Machines"
            value={loading && machines.length === 0 ? "—" : String(machines.length)}
            change={`${[...new Set(machines.map(m => m.machine_type))].length || 0} types`}
            icon={Cpu} color="blue" subtitle="From dataset.csv" />
          <Card title="Active Alerts"
            value={results.length === 0 ? "—" : String(totalAlerts)}
            change={`${highCount} critical · ${mediumCount} medium`}
            icon={AlertTriangle} color="yellow" subtitle="ML + Rule engine" />
          <Card title="Critical Issues"
            value={results.length === 0 ? "—" : String(highCount)}
            change={highCount > 0 ? "Immediate action needed" : "All clear"}
            icon={Zap} color="red"
            subtitle={highCount > 0 ? `${Math.round((highCount / Math.max(results.length, 1)) * 100)}% of fleet` : "No critical alerts"} />
          <Card title="AI Confidence"
            value={results.length === 0 ? "—" : `${avgConf}%`}
            change="Combined score"
            icon={Activity} color="green"
            subtitle={`${results.length}/${machines.length || "?"} analyzed`} />
        </div>

        {/* ── Chart + KPI ── */}
        <div className="grid grid-cols-3 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
            className="col-span-2 bg-white border border-slate-200 rounded-2xl p-5"
            onMouseEnter={() => setIsChartHovered(true)}
            onMouseLeave={() => setIsChartHovered(false)}
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-sm font-medium text-slate-700">Machine health analytics</h2>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {results.length} of {machines.length || "?"} machines analyzed
                </p>
              </div>
              {loading && (
                <span className="text-[10px] text-blue-500 flex items-center gap-1">
                  <Loader2 size={10} className="animate-spin" /> Live
                </span>
              )}
            </div>
            <div className="h-44 bg-slate-50 rounded-xl p-2 border border-slate-100">
              <MiniBarChart data={chartData} isHovered={isChartHovered} />
            </div>
            <div className="flex items-center gap-5 mt-3 px-1">
              {[["#94a3b8", "Low"], ["#f59e0b", "Medium"], ["#ef4444", "High"]].map(([c, l]) => (
                <div key={l} className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-sm" style={{ background: c }} />
                  <span className="text-[10px] text-slate-400">{l} risk</span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="bg-white border border-slate-200 rounded-2xl p-5"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-medium text-slate-700">KPI metrics</h2>
              <span className="text-[9px] font-medium text-slate-400 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded uppercase tracking-wider">
                {loading ? `${progress}%` : "Live"}
              </span>
            </div>
            {results.length === 0
              ? <div className="grid grid-cols-2 gap-3">{[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24" />)}</div>
              : <div className="grid grid-cols-2 gap-1">
                  <RingGauge value={avgTempPct} label="Temperature" />
                  <RingGauge value={avgVibrPct} label="Vibration" />
                  <RingGauge value={avgRpmPct}  label="RPM" />
                  <RingGauge value={avgConf}    label="Confidence" />
                </div>
            }
          </motion.div>
        </div>

        {/* ── Alerts + AI Insight ── */}
        <div className="grid grid-cols-3 gap-4">

          {/* Alerts panel */}
          <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className="bg-white border border-slate-200 rounded-2xl p-5 overflow-y-auto max-h-[480px]"
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-sm font-medium text-slate-700">Recent alerts</h2>
                <p className="text-[10px] text-slate-400 mt-0.5">Tap to see maintenance plan</p>
              </div>
              {highCount > 0 && (
                <span className="text-[10px] font-medium bg-red-50 text-red-500 px-2 py-0.5 rounded-full border border-red-100">
                  {highCount} critical
                </span>
              )}
            </div>

            {results.length === 0
              ? <div className="space-y-2">{[1, 2, 3].map(i => <Skeleton key={i} className="h-14" />)}</div>
              : <div className="space-y-2">
                  {results
                    .filter(r => r.response?.machine_status !== "Low")
                    .slice(0, 10)
                    .map(({ machine, response }, i) => (
                      <AlertCard key={machine.machine_id} machine={machine} response={response} index={i} />
                    ))
                  }
                  {results.filter(r => r.response?.machine_status !== "Low").length === 0 && (
                    <div className="text-center py-8 text-slate-400">
                      <CheckCircle size={24} className="mx-auto mb-2 text-blue-400 opacity-70" />
                      <p className="text-xs">All machines nominal</p>
                    </div>
                  )}
                </div>
            }
          </motion.div>

          {/* AI insight panel */}
          <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="col-span-2 bg-white border border-slate-200 rounded-2xl p-5"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-1.5 bg-blue-600 rounded-lg">
                <Bot size={16} className="text-white" />
              </div>
              <div className="flex-1">
                <h2 className="text-sm font-medium text-slate-700">AI insights</h2>
                <p className="text-[10px] text-slate-400">
                  {loading ? `Running LLMs… ${progress}%` : `Confidence: ${avgConf}%`}
                </p>
              </div>
              <div className="flex gap-2">
                <span className="text-[9px] font-medium px-2 py-1 rounded bg-blue-50 border border-blue-100 text-blue-600">
                  LLM 1 · gemma-3n
                </span>
                <span className="text-[9px] font-medium px-2 py-1 rounded bg-slate-50 border border-slate-200 text-slate-500">
                  LLM 2 · mistral-7b
                </span>
              </div>
            </div>

            {topResult && !loading && (
              <div className="flex items-center gap-2 mb-4 pb-4 border-b border-slate-100">
                <span className="text-[10px] text-slate-400">Highest risk:</span>
                <span className="text-[10px] font-medium text-slate-600 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                  {topResult.machine.machine_type} · ID-{topResult.machine.machine_id}
                </span>
                <RiskBadge risk={topResult.response?.machine_status} />
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              {/* LLM 1 */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 min-h-[120px]">
                <p className="text-[9px] font-semibold text-blue-600 uppercase tracking-widest mb-2">
                  LLM 1 · Diagnosis — gemma-3n
                </p>
                {results.length === 0
                  ? <div className="flex items-center gap-2 text-slate-300">
                      <Loader2 size={11} className="animate-spin" />
                      <span className="text-xs">Waiting…</span>
                    </div>
                  : <AnimatePresence mode="wait">
                      <motion.p
                        key={topResult?.machine?.machine_id ?? "d"}
                        initial={{ opacity: 0, y: 3 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}
                        className="text-xs text-slate-500 leading-relaxed"
                      >
                        {topResult?.response?.explanation ?? "No explanation available."}
                      </motion.p>
                    </AnimatePresence>
                }
              </div>

              {/* LLM 2 */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 min-h-[120px]">
                <div className="flex items-center gap-1.5 mb-2">
                  <Wrench size={10} className="text-slate-400" />
                  <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-widest">
                    LLM 2 · Maintenance — mistral-7b
                  </p>
                </div>
                {results.length === 0
                  ? <div className="flex items-center gap-2 text-slate-300">
                      <Loader2 size={11} className="animate-spin" />
                      <span className="text-xs">Waiting…</span>
                    </div>
                  : <AnimatePresence mode="wait">
                      <motion.div
                        key={topResult?.machine?.machine_id ?? "p"}
                        initial={{ opacity: 0, y: 3 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}
                      >
                        <MaintenanceSteps plan={topResult?.response?.maintenance_plan} />
                      </motion.div>
                    </AnimatePresence>
                }
              </div>
            </div>

            {!loading && topResult && (
              <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-100">
                <TrendingUp size={11} className="text-slate-300" />
                <span className="text-[10px] text-slate-400">
                  Rule:{" "}
                  <span className="text-slate-600 font-medium">{topResult.response?.rule_based}</span>
                  {" · "}ML:{" "}
                  <span className="text-slate-600 font-medium">{topResult.response?.ml_prediction}</span>
                  {" · "}Final:{" "}
                  <span className="text-blue-600 font-medium">{topResult.response?.machine_status}</span>
                </span>
              </div>
            )}
          </motion.div>
        </div>

        {/* ── Full fleet table ── */}
        {results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
            className="bg-white border border-slate-200 rounded-2xl p-5"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-medium text-slate-700">
                Full fleet analysis
                <span className="ml-2 text-slate-400 font-normal text-xs">
                  {results.length} machines
                </span>
              </h2>
              {loading && (
                <span className="text-[10px] text-blue-500 flex items-center gap-1">
                  <Loader2 size={10} className="animate-spin" /> Updating
                </span>
              )}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-100">
                    {["ID", "Type", "Temp", "Vibration", "RPM", "Rule", "ML", "Final", "Action"].map(h => (
                      <th key={h} className="px-3 py-2 text-[9px] font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {results.map(({ machine, response }, i) => (
                    <motion.tr
                      key={machine.machine_id}
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.004 * i }}
                      className={`border-b last:border-0 border-slate-50 hover:bg-slate-50 transition-colors ${
                        response.machine_status === "High"
                          ? "bg-red-50/20"
                          : response.machine_status === "Medium"
                          ? "bg-amber-50/20"
                          : ""
                      }`}
                    >
                      <td className="px-3 py-2.5 font-mono text-xs text-blue-600 font-medium">
                        #{machine.machine_id}
                      </td>
                      <td className="px-3 py-2.5 text-xs text-slate-600">{machine.machine_type}</td>
                      <td className="px-3 py-2.5 font-mono text-xs text-slate-500">{machine.temp.toFixed(1)}°C</td>
                      <td className="px-3 py-2.5 font-mono text-xs text-slate-500">{machine.vibration.toFixed(2)}</td>
                      <td className="px-3 py-2.5 font-mono text-xs text-slate-500">{machine.rpm.toFixed(0)}</td>
                      <td className="px-3 py-2.5"><RiskBadge risk={response.rule_based} /></td>
                      <td className="px-3 py-2.5"><RiskBadge risk={response.ml_prediction} /></td>
                      <td className="px-3 py-2.5"><RiskBadge risk={response.machine_status} /></td>
                      <td className="px-3 py-2.5 text-[10px] text-slate-400 max-w-[180px] truncate">
                        {response.recommended_action}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

      </div>
    </motion.div>
  );
};

export default Dashboard;