import Button from "../components/Button.jsx";
import Card from "../components/Card.jsx";
import EmptyState from "../components/EmptyState.jsx";
import PageShell from "../components/PageShell.jsx";
import MetricCard from "../components/MetricCard.jsx";
import { useAudit } from "../services/AuditContext.jsx";
import { downloadReport } from "../services/report.js";

export default function ReportPage() {
  const { audit, dataset } = useAudit();

  if (!dataset || !audit) {
    return (
      <PageShell>
        <EmptyState
          title="Report workspace is ready"
          message="Upload a CSV to prepare an exportable fairness summary for reviewers."
        />
      </PageShell>
    );
  }

  const verdict =
    audit.verdict || (audit.parity < 0.6 ? "Biased" : "Unbiased");

  const isBiased = verdict.toLowerCase().includes("bias");

  const verdictColor = isBiased
    ? "text-[#EA4335]"   // red
    : "text-[#34A853]";  // green

  return (
    <PageShell className="pb-16 overflow-x-hidden bg-[#f8f9fa]">
      <div className="mb-8 max-w-3xl">
        <p className="text-sm font-semibold text-[#4285F4]">
          Reviewer report
        </p>

        <h1 className="mt-2 text-3xl font-bold text-[#202124] sm:text-4xl">
          Fairness report
        </h1>

        <p className="mt-3 text-base text-[#5f6368]">
          A concise governance snapshot for {dataset.fileName}.
        </p>
      </div>

      <Card className="space-y-6 bg-white border border-[#e8eaed] shadow-sm">
        {/* HEADER */}
        <div className="flex flex-col gap-4 border-b border-[#e8eaed] pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-bold text-[#202124]">
              Ethicly audit summary
            </h2>

            <p className="mt-1 text-sm text-[#5f6368]">
              This model is{" "}
              <strong className={verdictColor}>{verdict}</strong> based on
              analysis using{" "}
              <strong className="text-[#4285F4]">
                {audit.sensitive_column}
              </strong>.
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={() => downloadReport(audit)}
              variant="primary"
            >
              Download Report
            </Button>

            <Button to="/dashboard" variant="secondary">
              Back to Dashboard
            </Button>
          </div>
        </div>

        {/* METRICS */}
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            label="Bias verdict"
            value={verdict}
            detail={
              isBiased
                ? "Significant disparity detected"
                : "No major bias detected"
            }
            tone={isBiased ? "red" : "green"}
          />

          <ReportStat
            label="Fairness score"
            value={`${audit.fairness_score}/100`}
            color="text-[#4285F4]"
          />

          <ReportStat
            label="Parity"
            value={audit.parity.toFixed(2)}
            color="text-[#FBBC05]"
          />

          <ReportStat
            label="Groups compared"
            value={audit.groupComparison.length}
            color="text-[#EA4335]" // 🔥 ALWAYS RED
          />
        </div>

        {/* INTERPRETATION */}
        <div className="rounded-xl border border-[#e8eaed] bg-white p-5 shadow-sm">
          <h3 className="text-lg font-semibold text-[#202124]">
            Interpretation
          </h3>

          <p className="mt-2 text-sm text-[#5f6368] leading-relaxed">
            {isBiased
              ? "The model shows unequal outcomes across groups. Approval rates differ significantly, indicating bias risk."
              : "The model shows consistent outcomes across groups. Approval rates are balanced, indicating fair decision-making."}
          </p>
        </div>

        {/* INSIGHTS */}
        <div className="text-sm text-[#5f6368] space-y-1">
          <p>• Parity close to 1 indicates fairness</p>
          <p>• Large approval gap indicates bias risk</p>
        </div>
      </Card>
    </PageShell>
  );
}

function ReportStat({ label, value, color }) {
  return (
    <div className="min-h-[120px] rounded-xl border border-[#e8eaed] bg-white p-5 shadow-sm hover:shadow-md transition">
      <p className="text-sm text-[#5f6368]">{label}</p>

      <p className={`mt-3 text-2xl font-bold ${color}`}>
        {value}
      </p>
    </div>
  );
}