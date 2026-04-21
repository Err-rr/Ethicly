import { useState } from "react";
import Card from "../components/Card.jsx";
import { uploadCSV } from "../services/api.js";

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

export default function ComparePage() {
  const [auditA, setAuditA] = useState(null);
  const [auditB, setAuditB] = useState(null);

  const handleUpload = async (file, setAudit) => {
    const res = await uploadCSV(file);
    setAudit(res);
  };

  const improvement =
    auditA && auditB
      ? auditB.fairness_score - auditA.fairness_score
      : 0;

  return (
    <PageShell>
      <div className="max-w-6xl mx-auto">

        <h1 className="text-3xl font-bold mb-8 text-[#202124]">
          Comparison Mode
        </h1>

        {/* 🔹 Upload */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card className="p-6">
            <p className="text-sm text-[#5f6368] mb-3">Dataset A</p>
            <input
              type="file"
              onChange={(e) =>
                handleUpload(e.target.files[0], setAuditA)
              }
            />
          </Card>

          <Card className="p-6">
            <p className="text-sm text-[#5f6368] mb-3">Dataset B</p>
            <input
              type="file"
              onChange={(e) =>
                handleUpload(e.target.files[0], setAuditB)
              }
            />
          </Card>
        </div>

        {/* 🔹 Graph */}
        {auditA && auditB && (
          <Card className="p-6 mb-8">
            <p className="text-sm text-[#5f6368] mb-4">
              Model Comparison
            </p>

            <div style={{ width: "100%", height: 320 }}>
              <ResponsiveContainer>
                <BarChart
                  data={[
                    {
                      metric: "Fairness",
                      A: auditA.fairness_score,
                      B: auditB.fairness_score
                    },
                    {
                      metric: "Parity",
                      A: auditA.parity * 100,
                      B: auditB.parity * 100
                    },
                    {
                      metric: "Gap",
                      A: auditA.approval_gap * 100,
                      B: auditB.approval_gap * 100
                    }
                  ]}
                  barGap={12}
                  barCategoryGap="40%"
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#e5e7eb"
                  />

                  <XAxis
                    dataKey="metric"
                    tick={{ fill: "#5f6368", fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />

                  <YAxis
                    tick={{ fill: "#5f6368", fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />

                  <Tooltip
                    contentStyle={{
                      borderRadius: 10,
                      border: "none",
                      boxShadow:
                        "0 6px 20px rgba(0,0,0,0.08)"
                    }}
                  />

                  <Legend wrapperStyle={{ fontSize: 12 }} />

                  <Bar
                    dataKey="A"
                    fill="#EA4335"
                    radius={[6, 6, 0, 0]}
                    barSize={14}
                    name="Dataset A"
                  />

                  <Bar
                    dataKey="B"
                    fill="#34A853"
                    radius={[6, 6, 0, 0]}
                    barSize={14}
                    name="Dataset B"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        )}

        {/* 🔹 Metrics */}
        {auditA && auditB && (
          <div className="grid md:grid-cols-3 gap-6 mb-8">

            <Metric
              label="Fairness Score"
              a={auditA.fairness_score}
              b={auditB.fairness_score}
            />

            <Metric
              label="Parity"
              a={auditA.parity.toFixed(2)}
              b={auditB.parity.toFixed(2)}
            />

            <Metric
              label="Approval Gap"
              a={(auditA.approval_gap * 100).toFixed(1)}
              b={(auditB.approval_gap * 100).toFixed(1)}
              suffix="%"
            />

          </div>
        )}

        {/* 🔹 Verdict */}
        {auditA && auditB && (
          <Card className="p-6 mb-6">
            <p className="text-sm text-[#5f6368] mb-4">
              Bias Transition
            </p>

            <div className="flex items-center justify-between">

              <div>
                <p className="text-xs text-[#9aa0a6]">Before</p>
                <p className="text-lg font-semibold text-[#EA4335]">
                  {auditA.verdict}
                </p>
              </div>

              <div className="text-xl text-[#9aa0a6]">→</div>

              <div className="text-right">
                <p className="text-xs text-[#9aa0a6]">After</p>
                <p className="text-lg font-semibold text-[#34A853]">
                  {auditB.verdict}
                </p>
              </div>

            </div>
          </Card>
        )}

        {/* 🔹 Improvement */}
        {auditA && auditB && (
          <Card className="p-6 text-center">
            <p className="text-sm text-[#5f6368]">
              Fairness Improvement
            </p>

            <p
              className="text-2xl font-bold mt-2"
              style={{
                color:
                  improvement > 0
                    ? "#34A853"
                    : improvement < 0
                    ? "#EA4335"
                    : "#5f6368"
              }}
            >
              {improvement > 0 ? "+" : ""}
              {improvement}
            </p>
          </Card>
        )}

      </div>
    </PageShell>
  );
}

/* 🔹 Metric Component */
function Metric({ label, a, b, suffix = "" }) {
  return (
    <div className="p-5 rounded-2xl border border-[#e5e7eb] bg-white shadow-sm hover:shadow-md transition">

      <p className="text-xs text-[#5f6368] uppercase tracking-wide">
        {label}
      </p>

      <div className="mt-4 flex justify-between items-center">

        <div>
          <p className="text-xs text-[#9aa0a6]">Dataset A</p>
          <p className="text-lg font-semibold text-[#EA4335]">
            {a}{suffix}
          </p>
        </div>

        <div className="h-6 w-px bg-[#e5e7eb]" />

        <div className="text-right">
          <p className="text-xs text-[#9aa0a6]">Dataset B</p>
          <p className="text-lg font-semibold text-[#34A853]">
            {b}{suffix}
          </p>
        </div>

      </div>
    </div>
  );
}