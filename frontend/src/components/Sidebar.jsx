import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, BarChart3, AlertTriangle, Wrench, Cpu, Wifi, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";

const Sidebar = () => {
  const location = useLocation();
  const [time, setTime] = useState(new Date());
  const [systemLoad, setSystemLoad] = useState(32);

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date());
      setSystemLoad(prev => {
        const delta = (Math.random() - 0.5) * 6;
        return Math.min(85, Math.max(20, prev + delta));
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const menu = [
    { name: "Dashboard", icon: LayoutDashboard, path: "/" },
    { name: "Analytics", icon: BarChart3, path: "/analytics" },
    // { name: "Alerts", icon: AlertTriangle, path: "/alerts" },
    // { name: "Maintenance", icon: Wrench, path: "/maintenance" },
    { name: "Test", icon: Wrench, path: "/test" },
    { name: "Add .csv File", icon: Wrench, path: "/input" }
  ];

  const formatTime = (d) =>
    d.toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" });

  return (
    <div className="h-screen w-64 flex flex-col bg-white border-r border-slate-200 select-none shadow-sm relative z-20">
      {/* Top line decoration */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-cyan-400" />

      {/* Logo Area */}
      <div className="p-6 pb-4 pt-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="relative">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
              className="w-10 h-10 rounded-xl flex items-center justify-center bg-blue-50 border border-blue-100 shadow-sm"
            >
              <Cpu size={22} className="text-blue-600" />
            </motion.div>
            <div className="absolute -top-1 -right-1 pulse-dot blue" />
          </div>

          <div>
            <h1 className="title-font font-bold text-lg text-slate-800 tracking-wide">
              PRED<span className="text-blue-600">·</span>AI
            </h1>
            <p className="tech-font text-xs text-slate-400 font-medium">SYS_v3.0_BRIGHT</p>
          </div>
        </div>

        {/* System time banner */}
        <div className="mt-4 px-3 py-2.5 rounded-lg flex items-center justify-between bg-slate-50 border border-slate-100 shadow-inner">
          <span className="tech-font text-sm text-slate-700 font-semibold">
            {formatTime(time)}
          </span>
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-blue-100/50">
            <Wifi size={12} className="text-blue-600" />
            <span className="text-[10px] font-bold text-blue-700">SYNC</span>
          </div>
        </div>
      </div>

      <div className="mx-6 mb-4 h-px bg-slate-100" />

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-1.5">
        <p className="px-3 mb-3 text-xs font-semibold text-slate-400 tracking-wider">
          MAIN MENU
        </p>

        {menu.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive
                ? "sidebar-item-active shadow-sm"
                : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                }`}
            >
              <Icon
                size={18}
                className={`transition-transform duration-200 ${isActive ? "text-blue-600" : "group-hover:scale-110"}`}
              />
              <span className="flex-1 font-medium text-[15px]">
                {item.name}
              </span>
              {isActive && (
                <ChevronRight size={16} className="text-blue-500" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom system stats */}
      <div className="p-5 m-5 rounded-2xl bg-slate-50 border border-slate-200 shadow-sm relative overflow-hidden">
        {/* Subtle background tech accent */}
        <div className="absolute -right-4 -top-4 text-slate-200 opacity-50">
          <Cpu size={80} />
        </div>

        <p className="text-xs font-bold text-slate-800 mb-3 relative z-10 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
          NETWORK LOAD
        </p>

        {/* CPU Load */}
        <div className="mb-4 relative z-10">
          <div className="flex justify-between mb-1.5">
            <span className="tech-font text-xs text-slate-500 font-semibold">CPU_USAGE</span>
            <span className="tech-font text-xs text-blue-600 font-bold">{systemLoad.toFixed(0)}%</span>
          </div>
          <div className="bright-progress-bar bg-slate-200">
            <motion.div
              className="bright-progress-fill"
              animate={{ width: `${systemLoad}%` }}
              transition={{ duration: 0.8 }}
            />
          </div>
        </div>

        {/* Online indicator */}
        <div className="mt-4 flex items-center gap-2 pt-3 border-t border-slate-200 relative z-10">
          <div className="pulse-dot green" />
          <span className="text-xs font-bold text-emerald-600">ALL SYSTEMS ONLINE</span>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;