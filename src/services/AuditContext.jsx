import { createContext, useContext, useMemo, useState } from "react";
import { createAuditFromRows, sampleAudit } from "../utils/auditEngine.js";

const AuditContext = createContext(null);

export function AuditProvider({ children }) {
  const [dataset, setDataset] = useState(null);
  const [audit, setAudit] = useState(sampleAudit);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");

  const uploadDataset = async ({ fileName, rows, columns }) => {
    setIsProcessing(true);
    setError("");

    await new Promise((resolve) => setTimeout(resolve, 700));

    try {
      const nextAudit = createAuditFromRows(rows, columns);
      setDataset({ fileName, rows, columns, uploadedAt: new Date().toISOString() });
      setAudit(nextAudit);
    } catch (nextError) {
      setError(nextError.message || "We could not process that dataset.");
    } finally {
      setIsProcessing(false);
    }
  };

  const value = useMemo(
    () => ({ dataset, audit, isProcessing, error, uploadDataset, setError }),
    [dataset, audit, isProcessing, error]
  );

  return <AuditContext.Provider value={value}>{children}</AuditContext.Provider>;
}

export function useAudit() {
  const context = useContext(AuditContext);

  if (!context) {
    throw new Error("useAudit must be used inside AuditProvider");
  }

  return context;
}
