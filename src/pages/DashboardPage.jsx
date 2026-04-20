import EmptyState from "../components/EmptyState.jsx";
import Card from "../components/Card.jsx";
import PageShell from "../components/PageShell.jsx";
import GroupComparisonChart from "../components/charts/GroupComparisonChart.jsx";
import FairnessTrendChart from "../components/charts/FairnessTrendChart.jsx";
import { useAudit } from "../services/AuditContext.jsx";
import { useState } from "react";
import { getBiasExplanation } from "../services/gemini";

export default function DashboardPage() {
  const { audit } = useAudit();

  const [explanation, setExplanation] = useState("");
  const [loadingAI, setLoadingAI] = useState(false);

  if (!audit) {
    return (
      <PageShell>
        <EmptyState
          title="No audit data yet"
          message="Upload a CSV to generate fairness insights."
        />
      </PageShell>
    );
  }

  const verdict =
    audit.verdict || (audit.parity < 0.6 ? "Biased" : "Unbiased");

  return (
    <PageShell>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#202124]">Fairness overview</h1>
        <p className="text-sm text-[#5f6368] mt-2">
          Real audit based on {audit.sensitive_column} vs {audit.target_column}
        </p>
      </div>

      {/* TOP CARDS */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">

        <MiniCard
          label="Bias verdict"
          value={verdict}
          color={verdict === "Biased" ? "#EA4335" : "#34A853"}
        />

        <MiniCard
          label="Fairness score"
          value={`${audit.fairness_score}/100`}
          color="#4285F4"
        />

        <MiniCard
          label="Parity"
          value={audit.parity.toFixed(2)}
          color="#FBBC05"
        />

        <MiniCard
          label="Approval gap"
          value={`${(audit.approval_gap * 100).toFixed(1)}%`}
          color="#EA4335"
        />
      </div>

      {/* MAIN SECTION */}
      <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_1fr]">

        {/* GRAPH */}
        <GroupComparisonChart data={audit.groupComparison} />

        {/* 🔥 COMPACT BIAS + AI */}
        <Card>
          <h2 className="font-semibold text-[#202124]">
            Bias detection results
          </h2>

          <p className="text-xs text-[#5f6368] mt-1">
            Signals ranked for governance review
          </p>

          {/* SMALL LIST */}
          <div className="mt-4 space-y-2 text-sm">

            {audit.biasResults.map((r) => (
              <div key={r.label} className="flex justify-between items-center">
                <span className="text-[#202124]">{r.label}</span>

                <div className="flex items-center gap-3">
                  <span className="text-[#5f6368] text-xs">{r.value}</span>

                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      r.status === "Pass"
                        ? "bg-[#e6f4ea] text-[#34A853]"
                        : r.status === "Monitor"
                        ? "bg-[#fff8e1] text-[#FBBC05]"
                        : "bg-[#fce8e6] text-[#EA4335]"
                    }`}
                  >
                    {r.status}
                  </span>
                </div>
              </div>
            ))}

          </div>

          {/* AI SECTION */}
          <div className="mt-5 border-t pt-4">

            <button
              onClick={async () => {
                setLoadingAI(true);
                const res = await getBiasExplanation(audit);
                setExplanation(res);
                setLoadingAI(false);
              }}
              className="text-xs px-3 py-2 bg-[#4285F4] text-white rounded"
            >
              Explain with AI
            </button>

            {loadingAI && (
              <p className="text-xs mt-2 text-[#5f6368]">Analyzing...</p>
            )}

            {explanation && (
              <p className="text-xs mt-3 text-[#5f6368] leading-relaxed whitespace-pre-line">
                {explanation}
              </p>
            )}

          </div>
        </Card>
      </div>

      {/* TREND GRAPH */}
      <div className="mt-6">
        <FairnessTrendChart data={audit.trend} />
      </div>

    </PageShell>
  );
}

/* MINI CARD */

function MiniCard({ label, value, color }) {
  return (
    <Card>
      <p className="text-xs text-[#5f6368]">{label}</p>
      <p className="text-2xl font-bold mt-2" style={{ color }}>
        {value}
      </p>
    </Card>
  );
}