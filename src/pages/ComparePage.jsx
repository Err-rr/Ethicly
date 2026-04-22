import { useState } from "react";
import PageShell from "../components/PageShell";
import Card from "../components/Card";
import ComparisonChart from "../components/charts/ComparisonChart";

export default function ComparePage() {
  const [fileA, setFileA] = useState(null);
  const [fileB, setFileB] = useState(null);

  const [auditA, setAuditA] = useState(null);
  const [auditB, setAuditB] = useState(null);

  const [loading, setLoading] = useState(false);

  const uploadFile = async (file, setter) => {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("https://ethicaly.onrender.com/upload", {
      method: "POST",
      body: formData
    });

    const data = await res.json();
    if (!data.error) setter(data);
  };

  const handleCompare = async () => {
    if (!fileA || !fileB) return;

    setLoading(true);
    await uploadFile(fileA, setAuditA);
    await uploadFile(fileB, setAuditB);
    setLoading(false);
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
          <h1 className="text-4xl font-bold text-black">
            Model Comparison
          </h1>
          <p className="text-[#5f6368] mt-2">
            Compare fairness using statistical metrics (parity, gap, p-value)
          </p>
        </div>

        {/* 🔥 Upload */}
        <div className="grid md:grid-cols-2 gap-6">
          <Upload title="Dataset A" onSelect={setFileA} />
          <Upload title="Dataset B" onSelect={setFileB} />
        </div>

        {/* 🔥 Compare Button */}
        <div className="flex justify-center">
          <button
            onClick={handleCompare}
            disabled={!fileA || !fileB || loading}
            className={`px-8 py-3 rounded-xl font-semibold text-white transition 
            ${loading ? "bg-gray-400" : "bg-[#4285F4] hover:bg-[#3367d6]"}`}
          >
            {loading ? "Comparing..." : "Compare"}
          </button>
        </div>

        {/* 🔥 RESULT */}
        {auditA && auditB && (
          <>
            {/* 🔥 Improvement */}
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

            {/* 🔥 Graph */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4 text-[#4285F4]">
                Performance Overview
              </h2>
              <ComparisonChart auditA={auditA} auditB={auditB} />
            </Card>

            {/* 🔥 KPI */}
            <div className="grid md:grid-cols-3 gap-6">
              <KPI title="Fairness Score" a={auditA.fairness_score} b={auditB.fairness_score} />
              <KPI title="Parity" a={auditA.parity.toFixed(2)} b={auditB.parity.toFixed(2)} />
              <KPI
                title="Approval Gap"
                a={(auditA.approval_gap * 100).toFixed(1)}
                b={(auditB.approval_gap * 100).toFixed(1)}
                suffix="%"
              />
            </div>

            {/* 🔥 Statistical Insight */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4 text-[#FBBC05]">
                Statistical Insight
              </h2>

              <p className="text-sm text-[#5f6368]">
                Dataset A P-value: <b>{auditA.p_value}</b><br />
                Dataset B P-value: <b>{auditB.p_value}</b>
              </p>

              <p className="mt-3 text-sm">
                {(auditA.p_value < 0.05 || auditB.p_value < 0.05)
                  ? "⚠ Statistically significant bias detected"
                  : "✔ No statistically significant bias detected"}
              </p>
            </Card>

            {/* 🔥 Verdict */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4 text-[#FBBC05]">
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

function Upload({ title, onSelect }) {
  return (
    <Card className="p-6">
      <p className="font-semibold mb-3 text-[#4285F4]">{title}</p>
      <input
        type="file"
        accept=".csv"
        onChange={(e) => onSelect(e.target.files[0])}
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