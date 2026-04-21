import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";

export default function ComparisonChart({ auditA, auditB }) {
  const data = [
    {
      name: "Fairness",
      A: auditA.fairness_score,
      B: auditB.fairness_score
    },
    {
      name: "Parity",
      A: auditA.parity * 100,
      B: auditB.parity * 100
    },
    {
      name: "Gap",
      A: auditA.approval_gap * 100,
      B: auditB.approval_gap * 100
    }
  ];

  return (
    <div style={{ width: "100%", height: 300 }}>
      <ResponsiveContainer>
        <BarChart data={data}>
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />

          <Bar dataKey="A" fill="#EA4335" name="Dataset A" />
          <Bar dataKey="B" fill="#34A853" name="Dataset B" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}