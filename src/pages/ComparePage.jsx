import { useState } from "react";
import PageShell from "../components/PageShell.jsx";
import Card from "../components/Card.jsx";
import ComparisonChart from "../components/charts/ComparisonChart.jsx";

export default function ComparePage() {
  const [auditA, setAuditA] = useState(null);
  const [auditB, setAuditB] = useState(null);
  const [loadingA, setLoadingA] = useState(false);
  const [loadingB, setLoadingB] = useState(false);

  const uploadFile = async (file, setAudit, setLoading) => {
    if (!file) return;

    setLoading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("http://127.0.0.1:5000/upload", {
        method: "POST",
        body: formData
      });

      const data = await res.json();

      if (data.error) {
        alert(data.error);
      } else {
        setAudit(data);
      }
    } catch (err) {
      console.error(err);
      alert("Upload failed");
    }

    setLoading(false);
  };

  const improvement =
    auditA && auditB
      ? auditB.fairness_score - auditA.fairness_score
      : null;

  return (
    <PageShell>
      <div className="max-w-6xl mx-auto">

        <h1 className="text-3xl font-bold mb-8 text-[#202124]">
          Comparison Mode
        </h1>

        {/* Upload Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          <UploadCard
            title="Dataset A"
            onUpload={(file) => uploadFile(file, setAuditA, setLoadingA)}
            loading={loadingA}
          />

          <UploadCard
            title="Dataset B"
            onUpload={(file) => uploadFile(file, setAuditB, setLoadingB)}
            loading={loadingB}
          />

        </div>

        {/* Results */}
        {auditA && auditB && (
          <div className="mt-10 space-y-8">

            {/* 🔥 Graph */}
            <Card>
              <h2 className="text-lg font-semibold mb-4 text-[#202124]">
                Model Comparison
              </h2>
              <ComparisonChart auditA={auditA} auditB={auditB} />
            </Card>

            {/* 🔥 Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

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

            {/* 🔥 Verdict */}
            <Card>
              <h2 className="font-semibold mb-3 text-[#202124]">
                Bias Verdict
              </h2>

              <div className="flex items-center justify-between text-lg font-semibold">

                <span style={{ color: "#EA4335" }}>
                  A: {auditA.verdict}
                </span>

                <span className="text-[#5f6368]">→</span>

                <span style={{ color: "#34A853" }}>
                  B: {auditB.verdict}
                </span>

              </div>
            </Card>

            {/* 🔥 Improvement */}
            <Card>
              <p className="text-center text-lg font-semibold text-[#202124]">
                Improvement:
                <span
                  style={{
                    marginLeft: 8,
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
                </span>
              </p>
            </Card>

          </div>
        )}

      </div>
    </PageShell>
  );
}

/* ---------- Upload Card ---------- */

function UploadCard({ title, onUpload, loading }) {
  return (
    <Card>
      <h2 className="font-semibold mb-3 text-[#202124]">{title}</h2>

      <input
        type="file"
        accept=".csv"
        onChange={(e) => onUpload(e.target.files[0])}
      />

      {loading && (
        <p className="text-sm mt-2 text-[#5f6368]">Uploading...</p>
      )}
    </Card>
  );
}

/* ---------- Metric Card ---------- */

function Metric({ label, a, b, suffix = "" }) {
  return (
    <div className="p-5 rounded-xl border border-[#e5e7eb] bg-white">
      <p className="text-sm text-[#5f6368]">{label}</p>

      <div className="mt-3 flex justify-between text-lg font-semibold">
        <span style={{ color: "#EA4335" }}>
          A: {a}{suffix}
        </span>

        <span style={{ color: "#34A853" }}>
          B: {b}{suffix}
        </span>
      </div>
    </div>
  );
}