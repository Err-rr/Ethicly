import {
  Bar,
  BarChart,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import Card from "../Card.jsx";

export default function GroupComparisonChart({ data }) {
  return (
    <Card>
      <div className="mb-5">
        <h2 className="text-lg font-bold text-[#202124]">Group comparison</h2>
        <p className="mt-1 text-sm text-[#5f6368]">Approval and estimated error rates by protected segment.</p>
      </div>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
            <XAxis dataKey="group" axisLine={false} tickLine={false} tick={{ fill: "#5f6368", fontSize: 12 }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: "#5f6368", fontSize: 12 }} />
            <Tooltip
              contentStyle={{
                border: "1px solid #e8eaed",
                borderRadius: 12,
                boxShadow: "0 8px 24px rgba(60, 64, 67, 0.08)"
              }}
            />
            <Legend />
            <Bar
              dataKey="approvalRate"
              name="Approval rate"
              fill="#4285F4"
              radius={[8, 8, 0, 0]}
              maxBarSize={34}
              animationDuration={900}
            />
            <Bar
              dataKey="errorRate"
              name="Error rate"
              fill="#EA4335"
              radius={[8, 8, 0, 0]}
              maxBarSize={34}
              animationDuration={900}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
