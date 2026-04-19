import { motion } from "framer-motion";
import EmptyState from "../components/EmptyState.jsx";
import MetricCard from "../components/MetricCard.jsx";
import Card from "../components/Card.jsx";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import PageShell from "../components/PageShell.jsx";
import Skeleton from "../components/Skeleton.jsx";
import GroupComparisonChart from "../components/charts/GroupComparisonChart.jsx";
import FairnessTrendChart from "../components/charts/FairnessTrendChart.jsx";
import { useAudit } from "../services/AuditContext.jsx";

export default function DashboardPage() {
  const { audit, dataset, isProcessing } = useAudit();

  if (!audit) {
    return (
      <PageShell>
        <EmptyState
          title="No audit data yet"
          message="Upload a CSV to generate fairness metrics, group comparisons, and bias detection results."
        />
      </PageShell>
    );
  }

  const sensitive = audit?.sensitive_column || "selected feature";
  const target = audit?.target_column || "target";

  const verdict =
    audit.parity < 0.6 ? "Biased" : "Unbiased";

  return (
    <PageShell className="pb-16">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-semibold text-google-blue">Audit dashboard</p>
          <h1 className="mt-2 text-3xl font-bold text-[#202124] sm:text-4xl">
            Fairness overview
          </h1>
          <p className="mt-3 max-w-3xl text-base text-[#5f6368]">
            Real audit calculated from {sensitive} approval rates against {target}.
          </p>
        </div>
        {isProcessing && <LoadingSpinner label="Refreshing audit" />}
      </div>

      {isProcessing && <DashboardSkeleton />}

      {/* Responsive: 1 col → 2 col → 3 col → 5 col */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">

        <MetricCard
          label="Bias verdict"
          value={verdict}
          detail={
            verdict === "Biased"
              ? "Significant disparity detected"
              : "No major bias detected"
          }
          tone={verdict === "Biased" ? "red" : "green"}
        />

        <ScoreCard score={audit.fairness_score} />

        <MetricCard
          label="Parity"
          value={audit.parity.toFixed(2)}
          detail="Lowest approval rate divided by highest"
          tone="blue"
        />

        {/* Approval gap card — inline to control layout and fix badge alignment */}
        <Card className="min-h-44">
          <div className="flex flex-col h-full">
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm font-semibold text-[#5f6368] leading-tight">Approval gap</p>
              <span className="shrink-0 inline-flex items-center rounded-full bg-[#fff8df] px-2.5 py-0.5 text-xs font-semibold text-yellow-700">
                Live
              </span>
            </div>
            <p className="mt-4 text-4xl font-bold text-[#202124] break-all">
              {(audit.approval_gap * 100).toFixed(1)}%
            </p>
            <p className="mt-3 text-sm text-[#5f6368]">
              Difference between highest and lowest groups
            </p>
          </div>
        </Card>

        <MetricCard
          label="Data status"
          value="Live"
          detail="Uploaded dataset active"
          tone="green"
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_0.9fr]">
        <GroupComparisonChart data={audit.groupComparison} />
        <BiasResults results={audit.biasResults} />
      </div>

      <div className="mt-6">
        <FairnessTrendChart data={audit.trend} />
      </div>
    </PageShell>
  );
}

function ScoreCard({ score }) {
  return (
    <Card className="min-h-44">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-[#5f6368]">Fairness score</p>
          <p className="mt-4 text-4xl font-bold text-[#202124]">
            {score}/100
          </p>
          <p className="mt-3 text-sm text-[#5f6368]">
            Composite parity health
          </p>
        </div>

        {/* Fixed: removed bg-white shadow rounded-full that caused the awkward circle */}
        <div className="relative grid size-16 shrink-0 place-items-center">
          <svg className="absolute size-16 -rotate-90" viewBox="0 0 64 64">
            <circle cx="32" cy="32" r="27" fill="none" stroke="#edf2f7" strokeWidth="6" />
            <motion.circle
              cx="32"
              cy="32"
              r="27"
              fill="none"
              stroke="#4285F4"
              strokeLinecap="round"
              strokeWidth="6"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: score / 100 }}
              transition={{ duration: 0.8 }}
            />
          </svg>
          <span className="text-xs font-bold text-[#3c4043]">{score}%</span>
        </div>
      </div>
    </Card>
  );
}

function DashboardSkeleton() {
  return (
    <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {[0, 1, 2].map((item) => (
        <div key={item} className="rounded-xl bg-[#f8fafc] p-6">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="mt-5 h-9 w-28" />
          <Skeleton className="mt-4 h-3 w-36" />
        </div>
      ))}
    </div>
  );
}

function BiasResults({ results }) {
  const statusClasses = {
    Pass: "bg-[#eaf6ee] text-green-700",
    Monitor: "bg-[#fff8df] text-yellow-700",
    Review: "bg-[#fdecea] text-red-600"
  };

  return (
    <Card>
      <h2 className="text-lg font-bold text-[#202124]">Bias detection results</h2>
      <p className="mt-1 text-sm text-[#5f6368]">
        Signals ranked for model governance review.
      </p>

      <div className="mt-5 space-y-3">
        {results.map((result, index) => (
          <motion.div
            key={result.label}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="rounded-xl border border-[#e5e7eb] bg-white p-4"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="font-semibold">{result.label}</p>
                <p className="text-sm text-[#5f6368]">{result.value}</p>
              </div>

              <span className={`shrink-0 px-3 py-1 text-xs font-semibold rounded ${statusClasses[result.status]}`}>
                {result.status}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </Card>
  );
}