import { createContext, useContext, useMemo, useState } from "react";

const AuditContext = createContext(null);

export function AuditProvider({ children }) {
  const [dataset, setDataset] = useState(null);
  const [audit, setAudit] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");

  const uploadDataset = async (backendAudit) => {
    setIsProcessing(true);
    setError("");

    try {
      const nextAudit = normalizeBackendAudit(backendAudit);

      setDataset({
        fileName: backendAudit.fileName,
        rows: backendAudit.rows_preview,
        columns: backendAudit.columns,
        targetColumn: backendAudit.target_column,
        sensitiveColumn: backendAudit.sensitive_column,
        uploadedAt: new Date().toISOString()
      });

      setAudit(nextAudit);
    } catch (nextError) {
      setError(nextError.message || "We could not process that dataset.");
    } finally {
      setIsProcessing(false);
    }
  };

  const value = useMemo(
    () => ({
      dataset,
      audit,
      isProcessing,
      error,
      uploadDataset,
      setError
    }),
    [dataset, audit, isProcessing, error]
  );

  return <AuditContext.Provider value={value}>{children}</AuditContext.Provider>;
}

function normalizeBackendAudit(data) {
  const groupRates = data.group_rates || {};
  const groupDistribution = data.group_distribution || {};

  const groupComparison = Object.entries(groupRates).map(([group, rate]) => ({
    group,
    approvalRate: Math.round(Number(rate || 0) * 1000) / 10
  }));

  const parity = Number(data.parity ?? 0);
  const approvalGap = Number(data.approval_gap ?? 0);
  const fairnessScore = Number(data.fairness_score ?? 0);
  const verdict = data.verdict || "Unknown";

  const sensitive = data.sensitive_column || "selected feature";
  const target = data.target_column || "target";

  return {
    ...data,

    fairness_score: fairnessScore,
    parity,
    approval_gap: approvalGap,
    approvalGap,

    group_rates: groupRates,
    groupComparison,
    group_distribution: groupDistribution,

    verdict,

    biasResults: [
      {
        label: "Demographic parity",
        status:
          parity >= 0.8 ? "Pass" :
          parity >= 0.6 ? "Monitor" :
          "Review",
        value: `${parity.toFixed(2)} ratio`
      },
      {
        label: "Approval gap",
        status:
          approvalGap <= 0.12 ? "Pass" :
          approvalGap <= 0.22 ? "Monitor" :
          "Review",
        value: `${(approvalGap * 100).toFixed(1)}% gap`
      },
      {
        label: "Group coverage",
        status: groupComparison.length >= 2 ? "Pass" : "Review",
        value: `${groupComparison.length} group${groupComparison.length === 1 ? "" : "s"} found`
      }
    ],

    summary: `Real audit calculated from ${sensitive} approval rates against ${target}.`,

    trend: [
      {
        name: "Latest",
        fairness: fairnessScore
      }
    ],

    sensitive_column: sensitive,
    target_column: target
  };
}

export function useAudit() {
  const context = useContext(AuditContext);

  if (!context) {
    throw new Error("useAudit must be used inside AuditProvider");
  }

  return context;
}