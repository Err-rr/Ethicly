import { motion } from "framer-motion";
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

const chartData = [
  { name: "Jan", fairness: 66, drift: 29, parity: 52, repair: 38 },
  { name: "Feb", fairness: 70, drift: 32, parity: 56, repair: 45 },
  { name: "Mar", fairness: 73, drift: 30, parity: 61, repair: 51 },
  { name: "Apr", fairness: 79, drift: 27, parity: 66, repair: 59 },
  { name: "May", fairness: 84, drift: 24, parity: 71, repair: 68 },
  { name: "Jun", fairness: 89, drift: 21, parity: 76, repair: 74 }
];

const summaryCards = [
  { label: "Parity", value: "0.91", color: "bg-google-green" },
  { label: "Risk", value: "Low", color: "bg-google-blue" },
  { label: "Alerts", value: "2", color: "bg-google-yellow" }
];

export default function HeroVisual() {
  return (
    <motion.div
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.45, ease: "easeOut", delay: 0.08 }}
      whileHover={{ rotateX: 1.5, rotateY: -1.5, scale: 1.01 }}
      className="hero-visual hidden lg:block"
      aria-label="Interactive fairness audit preview"
    >
      <div className="hero-visual-grid" />

      <div className="premium-surface relative h-[536px] overflow-hidden rounded-2xl p-6">
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-[#5f6368]">Bias audit stream</p>
            <p className="mt-1 text-2xl font-bold text-[#202124]">89% fairness</p>
          </div>
          <span className="rounded-full bg-[#eaf6ee] px-3 py-1 text-xs font-semibold text-google-green ring-1 ring-[#d8efdf]">
            Audit ready
          </span>
        </div>

        <div className="relative z-10 mt-7 h-56 rounded-2xl border border-[#e5e7eb] bg-[#F8FAFC] p-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 12, right: 8, left: -26, bottom: 0 }}>
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#5f6368", fontSize: 12 }} />
              <YAxis hide domain={[15, 95]} />
              <Tooltip
                cursor={{ stroke: "rgba(66,133,244,0.18)", strokeWidth: 1 }}
                contentStyle={{
                  border: "1px solid #e8eaed",
                  borderRadius: 12,
                  boxShadow: "0 8px 24px rgba(60, 64, 67, 0.08)"
                }}
              />
              <Line
                type="monotone"
                dataKey="fairness"
                stroke="#4285F4"
                strokeWidth={2.6}
                dot={{ r: 3, strokeWidth: 2, fill: "#ffffff" }}
                activeDot={{ r: 6, stroke: "#4285F4", strokeWidth: 2, fill: "#ffffff" }}
                animationDuration={850}
              />
              <Line
                type="monotone"
                dataKey="repair"
                stroke="#34A853"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 5 }}
                animationDuration={850}
              />
              <Line
                type="monotone"
                dataKey="parity"
                stroke="#FBBC05"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 5 }}
                animationDuration={850}
              />
              <Line
                type="monotone"
                dataKey="drift"
                stroke="#EA4335"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 5 }}
                animationDuration={850}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="relative z-10 mt-6 grid grid-cols-3 gap-5">
          {summaryCards.map((card) => (
            <div
              key={card.label}
              className="flex min-h-[136px] flex-col justify-center rounded-xl border border-[#e5e7eb] bg-white p-6 shadow-[0_4px_14px_rgba(15,23,42,0.04)]"
            >
              <span className={`mb-4 block h-1.5 w-9 rounded-full ${card.color}`} />
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#5f6368]">{card.label}</p>
              <p className="mt-3 text-3xl font-bold leading-none tracking-normal text-[#202124]">{card.value}</p>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
