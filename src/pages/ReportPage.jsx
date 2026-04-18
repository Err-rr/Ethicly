import Button from "../components/Button.jsx";
import Card from "../components/Card.jsx";
import EmptyState from "../components/EmptyState.jsx";
import PageShell from "../components/PageShell.jsx";
import { useAudit } from "../services/AuditContext.jsx";

export default function ReportPage() {
  const { audit, dataset } = useAudit();

  if (!dataset) {
    return (
      <PageShell>
        <EmptyState
          title="Report workspace is ready"
          message="Upload a CSV to prepare an exportable fairness summary for reviewers."
        />
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="mb-8 max-w-3xl">
        <p className="text-sm font-semibold text-google-blue">Reviewer report</p>
        <h1 className="mt-2 text-3xl font-bold tracking-normal text-[#202124] sm:text-4xl">Fairness report</h1>
        <p className="mt-3 text-base leading-7 text-[#5f6368]">
          A concise governance snapshot for {dataset.fileName}.
        </p>
      </div>

      <Card className="space-y-5">
        <div className="flex flex-col gap-3 border-b border-[#e5e7eb] pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-bold text-[#202124]">Ethicly audit summary</h2>
            <p className="mt-1 text-sm text-[#5f6368]">{audit.summary}</p>
          </div>
          <Button to="/dashboard" variant="secondary">
            Back to Dashboard
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <ReportStat label="Fairness score" value={`${audit.fairness_score}/100`} />
          <ReportStat label="Parity" value={audit.parity.toFixed(2)} />
          <ReportStat label="Groups compared" value={audit.groupComparison.length} />
        </div>
      </Card>
    </PageShell>
  );
}

function ReportStat({ label, value }) {
  return (
    <div className="min-h-32 rounded-xl border border-[#e5e7eb] bg-[#F8FAFC] p-5 shadow-[0_4px_14px_rgba(15,23,42,0.04)]">
      <p className="text-sm font-medium text-[#5f6368]">{label}</p>
      <p className="mt-3 text-3xl font-bold text-[#202124]">{value}</p>
    </div>
  );
}
