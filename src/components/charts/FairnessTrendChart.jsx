import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import Card from "../Card.jsx";

export default function FairnessTrendChart({ data }) {
  return (
    <Card>
      <div className="mb-5">
        <h2 className="text-lg font-bold text-[#202124]">Fairness trend</h2>
        <p className="mt-1 text-sm text-[#5f6368]">Score movement across recent evaluation runs.</p>
      </div>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="fairnessTrend" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4285F4" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#4285F4" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#5f6368", fontSize: 12 }} />
            <YAxis domain={[40, 100]} axisLine={false} tickLine={false} tick={{ fill: "#5f6368", fontSize: 12 }} />
            <Tooltip
              contentStyle={{
                border: "1px solid #e8eaed",
                borderRadius: 12,
                boxShadow: "0 8px 24px rgba(60, 64, 67, 0.08)"
              }}
            />
            <Area
              type="monotone"
              dataKey="fairness"
              stroke="#4285F4"
              strokeWidth={2.5}
              fill="url(#fairnessTrend)"
              animationDuration={900}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
