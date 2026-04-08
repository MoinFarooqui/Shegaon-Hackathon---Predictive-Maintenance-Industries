import Sidebar from "../components/Sidebar";
import { motion } from "framer-motion";
import { AlertTriangle, Zap, Info, CheckCircle, Filter, Bell, ChevronRight } from "lucide-react";
import { useState } from "react";

const alerts = [
  { id: "ALT-001", machine: "Machine A", msg: "Core temperature exceeded 90°C threshold", level: "critical", time: "02m ago", sensor: "TEMP_SENSOR_01" },
  { id: "ALT-002", machine: "Machine B", msg: "Vibration amplitude spike: 3.2 mm/s", level: "warning", time: "15m ago", sensor: "VIB_SENSOR_03" },
  { id: "ALT-003", machine: "Machine C", msg: "Pressure drop below safe operating range", level: "warning", time: "42m ago", sensor: "PRES_SENSOR_02" },
  { id: "ALT-004", machine: "Machine D", msg: "Bearing wear indicator at 78%", level: "critical", time: "1h ago", sensor: "WEAR_SENSOR_01" },
  { id: "ALT-005", machine: "Machine E", msg: "Scheduled maintenance due in 2 days", level: "info", time: "2h ago", sensor: "SYS_MONITOR" },
  { id: "ALT-006", machine: "Machine F", msg: "All parameters within normal range", level: "ok", time: "3h ago", sensor: "SYS_MONITOR" },
];

const levelConfig = {
  critical: { color: "text-red-600", bg: "bg-red-50", border: "border-red-200", iconBg: "bg-red-100", icon: Zap, label: "CRITICAL", shadow: "shadow-red-50" },
  warning:  { color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200", iconBg: "bg-amber-100", icon: AlertTriangle, label: "WARNING", shadow: "shadow-amber-50" },
  info:     { color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200", iconBg: "bg-blue-100", icon: Info, label: "INFO", shadow: "shadow-blue-50" },
  ok:       { color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200", iconBg: "bg-emerald-100", icon: CheckCircle, label: "NOMINAL", shadow: "shadow-emerald-50" },
};

const Alerts = () => {
  const [filter, setFilter] = useState("all");

  const filtered = filter === "all" ? alerts : alerts.filter(a => a.level === filter);

  const counts = {
    critical: alerts.filter(a => a.level === "critical").length,
    warning: alerts.filter(a => a.level === "warning").length,
    info: alerts.filter(a => a.level === "info").length,
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />

      <div className="flex-1 p-8 space-y-6 overflow-y-auto w-full max-w-[1400px] mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div>
            <span className="text-xs font-bold text-red-500 tracking-widest px-2 py-1 bg-red-50 rounded-md border border-red-100 mb-2 inline-block">
              MODULE :: INCIDENTS
            </span>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight">
              SYSTEM <span className="text-red-600 title-font">ALERTS</span>
            </h1>
            <p className="text-sm font-medium text-slate-500 mt-2">
              Centralized incident log and sensor anomalies
            </p>
          </div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-3 px-5 py-3 rounded-xl bg-red-50 border border-red-200 shadow-sm cursor-pointer"
          >
            <Bell size={18} className="text-red-600 animate-bounce" />
            <span className="text-sm font-bold text-red-700 tracking-wide">
              {counts.critical} CRITICAL ACTIVE
            </span>
          </motion.div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-6">
          {[
            { label: "Critical", count: counts.critical, color: "text-red-600", bg: "bg-red-50", border: "border-red-200" },
            { label: "Warning",  count: counts.warning,  color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200" },
            { label: "Routine",  count: counts.info,     color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200" },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -4, scale: 1.02 }}
              className={`p-6 rounded-2xl bg-white border shadow-sm text-center cursor-pointer transition-all ${s.border} hover:shadow-md`}
            >
              <div className={`w-12 h-12 rounded-full ${s.bg} flex items-center justify-center mx-auto mb-3`}>
                <span className={`text-2xl font-black title-font ${s.color}`}>{s.count}</span>
              </div>
              <p className="text-xs font-bold text-slate-500 tracking-widest uppercase">
                {s.label}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-sm w-fit">
          <Filter size={16} className="text-slate-400 ml-2" />
          {["all", "critical", "warning", "info", "ok"].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
                filter === f 
                  ? "bg-slate-800 text-white shadow-md" 
                  : "bg-slate-50 text-slate-500 border border-slate-200 hover:bg-slate-100 hover:text-slate-800"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Alert List */}
        <div className="space-y-4">
          {filtered.map((a, i) => {
            const cfg = levelConfig[a.level];
            const Icon = cfg.icon;
            return (
              <motion.div
                key={a.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ scale: 1.01 }}
                className={`flex items-start gap-4 p-5 rounded-2xl bg-white border shadow-sm cursor-pointer transition-all ${cfg.border} hover:shadow-md ${cfg.shadow} group`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 border ${cfg.bg} ${cfg.border}`}>
                  <Icon size={20} className={cfg.color} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1.5">
                    <span className="text-[10px] font-bold text-slate-400 font-mono bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                      {a.id}
                    </span>
                    <span className="text-[11px] font-bold text-slate-600 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                      {a.machine}
                    </span>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider border ${cfg.bg} ${cfg.color} ${cfg.border}`}>
                      {cfg.label}
                    </span>
                  </div>
                  <p className="text-[15px] font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                    {a.msg}
                  </p>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="text-[11px] font-medium text-slate-500 font-mono">
                      <strong className="text-slate-400">SENSOR:</strong> {a.sensor}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-end justify-between h-full">
                  <span className="text-[11px] font-bold text-slate-400 whitespace-nowrap bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
                    ⏱ {a.time}
                  </span>
                  <div className="mt-4 w-8 h-8 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <ChevronRight size={14} className="text-blue-500" />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Alerts;