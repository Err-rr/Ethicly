import { useState } from "react";
import PageShell from "../components/PageShell.jsx";
import Card from "../components/Card.jsx";
import ComparisonChart from "../components/charts/ComparisonChart.jsx";

export default function ComparePage() {
  const [auditA, setAuditA] = useState(null);
  const [auditB, setAuditB] = useState(null);

  const uploadFile = async (file, setter) => {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("http://127.0.0.1:5000/upload", {
      method: "POST",
      body: formData
    });

    const data = await res.json();
    if (!data.error) setter(data);
  };

  const improvement =
    auditA && auditB
      ? auditB.fairness_score - auditA.fairness_score
      : 0;

  return (
    <PageShell>
      <div className="max-w-6xl mx-auto space-y-8">

        {/* 🔥 HERO */}
        <div>
          <h1 className="text-4xl font-bold text-[#202124]">
            Model Comparison
          </h1>
          <p className="text-[#5f6368] mt-2">
            Compare fairness performance across datasets
          </p>
        </div>

        {/* 🔥 Upload */}
        <div className="grid md:grid-cols-2 gap-6">
          <Upload title="Dataset A" onUpload={(f) => uploadFile(f, setAuditA)} />
          <Upload title="Dataset B" onUpload={(f) => uploadFile(f, setAuditB)} />
        </div>

        {auditA && auditB && (
          <>
            {/* 🔥 IMPROVEMENT HERO */}
            <div className="rounded-2xl p-6 bg-gradient-to-r from-[#4285F4]/10 to-[#34A853]/10 border">
              <p className="text-sm text-[#5f6368]">Fairness Improvement</p>
              <h2
                className="text-3xl font-bold mt-1"
                style={{
                  color: improvement > 0 ? "#34A853" : "#EA4335"
                }}
              >
                {improvement > 0 ? "+" : ""}
                {improvement}
              </h2>
            </div>

            {/* 🔥 MAIN GRAPH */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">
                Performance Overview
              </h2>
              <ComparisonChart auditA={auditA} auditB={auditB} />
            </Card>

            {/* 🔥 KPI GRID */}
            <div className="grid md:grid-cols-3 gap-6">

              <KPI
                title="Fairness Score"
                a={auditA.fairness_score}
                b={auditB.fairness_score}
              />

              <KPI
                title="Parity"
                a={auditA.parity.toFixed(2)}
                b={auditB.parity.toFixed(2)}
              />

              <KPI
                title="Approval Gap"
                a={(auditA.approval_gap * 100).toFixed(1)}
                b={(auditB.approval_gap * 100).toFixed(1)}
                suffix="%"
              />

            </div>

            {/* 🔥 VERDICT SECTION */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">
                Bias Transition
              </h2>

              <div className="flex items-center justify-between">

                <div className="text-center">
                  <p className="text-sm text-[#5f6368]">Dataset A</p>
                  <p className="text-xl font-bold text-[#EA4335]">
                    {auditA.verdict}
                  </p>
                </div>

                <div className="text-2xl text-[#5f6368]">→</div>

                <div className="text-center">
                  <p className="text-sm text-[#5f6368]">Dataset B</p>
                  <p className="text-xl font-bold text-[#34A853]">
                    {auditB.verdict}
                  </p>
                </div>

              </div>
            </Card>

          </>
        )}

      </div>
    </PageShell>
  );
}

/* ---------- Upload ---------- */

function Upload({ title, onUpload }) {
  return (
    <Card className="p-6">
      <p className="font-semibold mb-3">{title}</p>
      <input
        type="file"
        accept=".csv"
        onChange={(e) => onUpload(e.target.files[0])}
      />
    </Card>
  );
}

/* ---------- KPI ---------- */

function KPI({ title, a, b, suffix = "" }) {
  return (
    <div className="p-5 rounded-2xl border bg-white shadow-sm">
      <p className="text-sm text-[#5f6368]">{title}</p>

      <div className="mt-3 flex justify-between items-end">
        <div>
          <p className="text-xs text-[#5f6368]">A</p>
          <p className="text-xl font-bold text-[#EA4335]">
            {a}{suffix}
          </p>
        </div>

        <div>
          <p className="text-xs text-[#5f6368]">B</p>
          <p className="text-xl font-bold text-[#34A853]">
            {b}{suffix}
          </p>
        </div>
      </div>
    </div>
  );
}