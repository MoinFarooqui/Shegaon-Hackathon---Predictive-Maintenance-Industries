import Sidebar from "../components/Sidebar";
import { motion } from "framer-motion";
import { Wrench, Calendar, Clock, CheckCircle, AlertCircle, Circle, ChevronRight } from "lucide-react";

const schedule = [
  { id: "WO-2401", machine: "Machine A", task: "Bearing replacement + lubrication", due: "Tomorrow", priority: "critical", tech: "TECH-03", duration: "4h", status: "pending" },
  { id: "WO-2402", machine: "Machine B", task: "Vibration sensor calibration", due: "In 3 days", priority: "warning", tech: "TECH-01", duration: "2h", status: "pending" },
  { id: "WO-2403", machine: "Machine C", task: "Scheduled oil change", due: "In 5 days", priority: "info", tech: "TECH-02", duration: "1h", status: "scheduled" },
  { id: "WO-2404", machine: "Machine D", task: "Filter inspection & replacement", due: "In 7 days", priority: "info", tech: "TECH-04", duration: "1.5h", status: "scheduled" },
  { id: "WO-2405", machine: "Machine E", task: "Full system diagnostic", due: "Overdue", priority: "critical", tech: "TECH-03", duration: "6h", status: "overdue" },
  { id: "WO-2406", machine: "Machine F", task: "Belt tension check", due: "Done", priority: "ok", tech: "TECH-01", duration: "0.5h", status: "done" },
];

const priorityCfg = {
  critical: { color: "text-red-600", bg: "bg-red-50", border: "border-red-200", label: "CRITICAL" },
  warning:  { color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200",  label: "HIGH" },
  info:     { color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200", label: "ROUTINE" },
  ok:       { color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200", label: "DONE" },
};

const statusIcon = { pending: Circle, scheduled: Clock, overdue: AlertCircle, done: CheckCircle };
const statusColor = { pending: "text-amber-500", scheduled: "text-blue-500", overdue: "text-red-500", done: "text-emerald-500" };

const Maintenance = () => {
  const pending  = schedule.filter(s => s.status === "pending" || s.status === "overdue").length;
  const done     = schedule.filter(s => s.status === "done").length;
  const upcoming = schedule.filter(s => s.status === "scheduled").length;

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />

      <div className="flex-1 p-8 space-y-6 overflow-y-auto w-full max-w-[1400px] mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div>
            <span className="text-xs font-bold text-purple-500 tracking-widest px-2 py-1 bg-purple-50 rounded-md border border-purple-100 mb-2 inline-block">
              MODULE :: SERVICE
            </span>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight">
              MAINTENANCE <span className="text-purple-600 title-font">SCHEDULER</span>
            </h1>
            <p className="text-sm font-medium text-slate-500 mt-2">
              Actionable work orders, technician dispatch, and lifecycle management
            </p>
          </div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-3 px-5 py-3 rounded-xl bg-purple-50 border border-purple-200 shadow-sm cursor-pointer hover:bg-purple-100"
          >
            <Calendar size={18} className="text-purple-600" />
            <span className="text-sm font-bold text-purple-700 tracking-wide uppercase">
              March 2026 Schedule
            </span>
          </motion.div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-6">
          {[
            { label: "Action Required", count: pending,  color: "text-red-600", bg: "bg-red-50", icon: AlertCircle },
            { label: "Upcoming Work",   count: upcoming, color: "text-amber-600", bg: "bg-amber-50", icon: Clock },
            { label: "Completed",       count: done,     color: "text-emerald-600", bg: "bg-emerald-50", icon: CheckCircle },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -4, scale: 1.02 }}
              className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center gap-5 cursor-pointer transition-shadow hover:shadow-md"
            >
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 ${s.bg}`}>
                <s.icon size={26} className={s.color} />
              </div>
              <div>
                <p className={`text-4xl font-black title-font tracking-tight ${s.color}`}>
                  {s.count}
                </p>
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mt-1">
                  {s.label}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Work Orders */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm overflow-hidden"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-widest flex items-center gap-2">
              <Wrench size={16} className="text-slate-400" />
              Work Order Queue
            </h2>
            <div className="flex gap-2">
              <button className="clean-btn active">Filter: Priority</button>
              <button className="clean-btn">My Tasks</button>
            </div>
          </div>

          <div className="space-y-3">
            {schedule.map((item, i) => {
              const pCfg = priorityCfg[item.priority];
              const StatusIcon = statusIcon[item.status];
              const sColorClass = statusColor[item.status];

              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.35 + i * 0.05 }}
                  whileHover={{ scale: 1.01, translateX: 5 }}
                  className={`flex items-center gap-5 px-5 py-4 rounded-xl cursor-pointer transition-all border shadow-sm ${
                    item.status === "overdue" ? "bg-red-50/50 border-red-200" : "bg-white border-slate-200 hover:shadow-md hover:border-blue-200 hover:bg-blue-50/30"
                  }`}
                >
                  {/* Status icon */}
                  <div className={`w-10 h-10 flex items-center justify-center rounded-lg bg-slate-50 border border-slate-100 flex-shrink-0`}>
                    <StatusIcon size={20} className={sColorClass} />
                  </div>

                  {/* WO ID + machine */}
                  <div className="w-28 flex-shrink-0 border-r border-slate-100 pr-4">
                    <p className="text-[11px] font-bold text-slate-500 tech-font bg-slate-100 px-2 py-0.5 rounded-sm inline-block mb-1">{item.id}</p>
                    <p className="text-[12px] font-bold text-blue-600 block truncate">{item.machine}</p>
                  </div>

                  {/* Task */}
                  <div className="flex-1 min-w-0">
                    <p className={`text-[15px] font-bold ${item.status === "overdue" ? "text-red-700" : "text-slate-800"}`}>
                      {item.task}
                    </p>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-[11px] font-medium text-slate-500 font-mono flex items-center gap-1 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
                        <Clock size={12} className="text-slate-400" /> {item.duration}
                      </span>
                      <span className="text-[11px] font-medium text-slate-500 font-mono flex items-center gap-1 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
                        👤 {item.tech}
                      </span>
                    </div>
                  </div>

                  {/* Priority badge */}
                  <span
                    className={`px-3 py-1 rounded-md text-[10px] font-bold flex-shrink-0 border uppercase tracking-widest ${pCfg.bg} ${pCfg.color} ${pCfg.border}`}
                  >
                    {pCfg.label}
                  </span>

                  {/* Due */}
                  <span
                    className={`text-xs font-bold font-mono min-w-[90px] text-right flex-shrink-0 ${
                      item.status === "overdue" ? "text-red-600 bg-red-100 px-2 py-1 rounded" : "text-slate-500"
                    }`}
                  >
                    {item.due}
                  </span>

                  <ChevronRight size={18} className="text-slate-300 ml-2" />
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Maintenance;