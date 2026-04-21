import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  CartesianGrid
} from "recharts";

export default function ComparisonChart({ auditA, auditB }) {
  if (!auditA || !auditB) return null;

  const data = [
    {
      metric: "Fairness Score",
      A: auditA.fairness_score,
      B: auditB.fairness_score
    },
    {
      metric: "Parity (%)",
      A: auditA.parity * 100,
      B: auditB.parity * 100
    },
    {
      metric: "Approval Gap (%)",
      A: auditA.approval_gap * 100,
      B: auditB.approval_gap * 100
    }
  ];

  return (
    <div style={{ width: "100%", height: 320 }}>
      <ResponsiveContainer>
        <BarChart
          data={data}
          barGap={20}
          barCategoryGap="50%"   // 🔥 more spacing
        >
          {/* subtle grid */}
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#e8eaed"
          />

          {/* X axis */}
          <XAxis
            dataKey="metric"
            tick={{ fill: "#5f6368", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />

          {/* Y axis */}
          <YAxis
            tick={{ fill: "#5f6368", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />

          {/* Tooltip */}
          <Tooltip
            contentStyle={{
              borderRadius: 12,
              border: "none",
              boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
              fontSize: 12
            }}
          />

          {/* Legend */}
          <Legend
            wrapperStyle={{ fontSize: 12 }}
          />

          {/* 🔴 Dataset A */}
          <Bar
            dataKey="A"
            fill="#EA4335"
            radius={[6, 6, 0, 0]}
            barSize={12}   // 🔥 thinner bars
            name="Dataset A"
          />

          {/* 🟢 Dataset B */}
          <Bar
            dataKey="B"
            fill="#34A853"
            radius={[6, 6, 0, 0]}
            barSize={12}   // 🔥 thinner bars
            name="Dataset B"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}