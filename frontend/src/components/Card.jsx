import { motion } from "framer-motion";
import { TrendingUp, TrendingDown } from "lucide-react";

const Card = ({ title, value, change, icon: Icon, color = "blue", subtitle }) => {
  const isPositive = change && !change.startsWith("-");

  const colorMap = {
    cyan: {
      bg: "bg-cyan-50",
      border: "border-cyan-200",
      text: "text-cyan-600",
      icon: "text-cyan-500",
      glow: "hover:shadow-cyan-100",
    },
    blue: {
      bg: "bg-blue-50",
      border: "border-blue-200",
      text: "text-blue-600",
      icon: "text-blue-500",
      glow: "hover:shadow-blue-100",
    },
    red: {
      bg: "bg-red-50",
      border: "border-red-200",
      text: "text-red-600",
      icon: "text-red-500",
      glow: "hover:shadow-red-100",
    },
    green: {
      bg: "bg-emerald-50",
      border: "border-emerald-200",
      text: "text-emerald-600",
      icon: "text-emerald-500",
      glow: "hover:shadow-emerald-100",
    },
    yellow: {
      bg: "bg-amber-50",
      border: "border-amber-200",
      text: "text-amber-600",
      icon: "text-amber-500",
      glow: "hover:shadow-amber-100",
    },
  };

  const c = colorMap[color] || colorMap.blue;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      whileHover={{ y: -6, scale: 1.02 }}
      className={`relative rounded-2xl p-6 bg-white border border-slate-200 shadow-sm cursor-pointer transition-all duration-300 hover:shadow-xl ${c.glow} overflow-hidden group`}
    >
      {/* Top accent line */}
      <div className={`absolute top-0 left-0 right-0 h-1.5 opacity-80 ${c.bg} transition-opacity duration-300 group-hover:opacity-100`} />

      {/* Background glow orb */}
      <div className={`absolute -top-10 -right-10 w-32 h-32 rounded-full opacity-20 blur-3xl ${c.bg} group-hover:scale-150 transition-transform duration-500`} />

      <div className="relative z-10 flex flex-col h-full gap-4">
        {/* Header row */}
        <div className="flex items-start justify-between">
          <p className="text-xs font-bold text-slate-500 tracking-wider uppercase" style={{ letterSpacing: "1px" }}>
            {title}
          </p>
          {Icon && (
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${c.bg} ${c.border} border shadow-inner group-hover:scale-110 transition-transform`}>
              <Icon size={20} className={c.icon} />
            </div>
          )}
        </div>

        {/* Value */}
        <div className="flex items-end justify-between mt-auto">
          <h2 className={`text-4xl font-black title-font tracking-tight ${c.text}`}>
            {value}
          </h2>

          {change && (
            <motion.div
              whileHover={{ scale: 1.1 }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border shadow-sm ${
                isPositive ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-red-50 border-red-200 text-red-700"
              }`}
            >
              {isPositive ? (
                <TrendingUp size={14} className="text-emerald-600" />
              ) : (
                <TrendingDown size={14} className="text-red-600" />
              )}
              <span className="text-xs font-bold font-mono tracking-tight">
                {change}
              </span>
            </motion.div>
          )}
        </div>

        {subtitle && (
          <p className="text-xs font-medium text-slate-400 mt-1 tech-font">
            {subtitle}
          </p>
        )}
      </div>
    </motion.div>
  );
};

export default Card;