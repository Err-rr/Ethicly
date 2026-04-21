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

  return (
    <PageShell className="pb-16 overflow-x-hidden">
      <div className="mb-8 max-w-3xl">
        <p className="text-sm font-semibold text-google-blue">
          Reviewer report
        </p>
        <h1 className="mt-2 text-3xl font-bold text-[#202124] sm:text-4xl">
          Fairness report
        </h1>
        <p className="mt-3 text-base text-[#5f6368]">
          A concise governance snapshot for {dataset.fileName}.
        </p>
      </div>

      <Card className="space-y-6">
        <div className="flex flex-col gap-4 border-b border-[#e5e7eb] pb-5 sm:flex-row sm:items-center sm:justify-between">
          
          <div>
            <h2 className="text-xl font-bold text-[#202124]">
              Ethicly audit summary
            </h2>
            <p className="mt-1 text-sm text-[#5f6368]">
              This model is <strong>{verdict}</strong> based on analysis using{" "}
              <strong>{audit.sensitive_column}</strong>.
            </p>
          </div>

          {/* 🔥 BUTTON GROUP */}
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
              verdict === "Biased"
                ? "Significant disparity detected across groups"
                : "No major bias detected across groups"
            }
            tone={verdict === "Biased" ? "red" : "green"}
          />

          <ReportStat
            label="Fairness score"
            value={`${audit.fairness_score}/100`}
          />

          <ReportStat
            label="Parity"
            value={audit.parity.toFixed(2)}
          />

          <ReportStat
            label="Groups compared"
            value={audit.groupComparison.length}
          />
        </div>

        {/* INTERPRETATION */}
        <div className="rounded-xl border border-[#e5e7eb] bg-white p-5">
          <h3 className="text-lg font-semibold text-[#202124]">
            Interpretation
          </h3>

          <p className="mt-2 text-sm text-[#5f6368] leading-relaxed">
            {verdict === "Biased"
              ? "The model shows unequal outcomes across groups. Approval rates differ significantly, indicating potential unfair treatment and bias risk."
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

function ReportStat({ label, value }) {
  return (
    <div className="min-h-[120px] rounded-xl border border-[#e5e7eb] bg-[#F8FAFC] p-5 shadow-sm">
      <p className="text-sm text-[#5f6368]">{label}</p>
      <p className="mt-3 text-2xl font-bold text-[#202124]">{value}</p>
    </div>
  );
}