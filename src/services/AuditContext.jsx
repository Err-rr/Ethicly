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

/* ---------------- NORMALIZER ---------------- */

function normalizeBackendAudit(data) {
  const groupRates = data.group_rates || {};

  const groupComparison = Object.entries(groupRates).map(([group, rate]) => ({
    group,
    approvalRate: Math.round(Number(rate || 0) * 1000) / 10 // % with 1 decimal
  }));

  const parity = Number(data.parity ?? 0);
  const approvalGap = Number(data.approval_gap ?? 0);
  const fairnessScore = Number(data.fairness_score ?? 0);

  const sensitive = data.sensitive_column || "selected feature";
  const target = data.target_column || "target";

  return {
    ...data,

    // core metrics
    fairness_score: fairnessScore,
    parity,
    approval_gap: approvalGap,
    approvalGap,

    // raw + processed
    group_rates: groupRates,
    groupComparison,

    // dashboard cards
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

    // 🔥 FIXED DYNAMIC SUMMARY (IMPORTANT)
    summary: `Real audit calculated from ${sensitive} approval rates against ${target}.`,

    // small chart
    trend: [
      {
        name: "Latest",
        fairness: fairnessScore
      }
    ],

    // 🔥 expose for UI usage directly
    sensitive_column: sensitive,
    target_column: target
  };
}

/* ---------------- HOOK ---------------- */

export function useAudit() {
  const context = useContext(AuditContext);

  if (!context) {
    throw new Error("useAudit must be used inside AuditProvider");
  }

  return context;
}