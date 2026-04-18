import { useCallback, useState } from "react";
import { motion } from "framer-motion";
import { useDropzone } from "react-dropzone";
import Button from "./Button.jsx";
import LoadingSpinner from "./LoadingSpinner.jsx";
import { useAudit } from "../services/AuditContext.jsx";

export default function FileUpload() {
  const { dataset, uploadDataset, isProcessing, error, setError } = useAudit();
  const [preview, setPreview] = useState(dataset);

  const onDrop = useCallback(
    async (acceptedFiles, rejectedFiles) => {
      setError("");

      if (rejectedFiles.length) {
        setError("Please upload a valid CSV file.");
        return;
      }

      const file = acceptedFiles[0];
      if (!file) return;

      try {
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("http://127.0.0.1:5000/upload", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Upload failed");
        }

        const nextDataset = {
          fileName: file.name,
          rows: data.rows_preview || [],
          columns: data.columns,
          targetColumn: data.target_column,
          sensitiveColumn: data.sensitive_column,
          groupRates: data.group_rates,
          parity: data.parity,
          approvalGap: data.approval_gap,
        };

        setPreview(nextDataset);
        await uploadDataset({ ...data, fileName: file.name });

      } catch (nextError) {
        setError(nextError.message || "Failed to upload dataset.");
      }
    },
    [setError, uploadDataset]
  );

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    accept: { "text/csv": [".csv"] },
    multiple: false,
    noClick: true,
    noKeyboard: true
  });

  const activePreview = preview || dataset;

  return (
    <div className="space-y-6">
      <motion.div
        {...getRootProps()}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.005 }}
        transition={{ duration: 0.26 }}
        className={`rounded-xl border-2 border-dashed bg-white p-8 text-center shadow-[0_8px_20px_rgba(15,23,42,0.05)] transition duration-200 ${
          isDragActive
            ? "border-google-blue bg-[#f1f6ff]"
            : "border-[#e5e7eb] hover:border-google-blue"
        }`}
      >
        <input {...getInputProps()} />
        <div className="mx-auto grid size-16 place-items-center rounded-xl bg-[#edf4ff] ring-1 ring-[#d8e7ff]">
          <span className="text-2xl font-bold text-google-blue">CSV</span>
        </div>
        <h2 className="mt-5 text-2xl font-bold text-[#202124]">Upload a fairness audit dataset</h2>
        <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-[#5f6368]">
          Drop in a CSV file. Ethicly will send it to backend, analyze it, and show results.
        </p>
        <Button onClick={open} className="mt-6">
          Choose CSV
        </Button>
      </motion.div>

      {isProcessing && <LoadingSpinner />}

      {error && (
        <div className="rounded-lg border border-[#f8d1cc] bg-[#fdecea] px-4 py-3 text-sm font-medium text-google-red">
          {error}
        </div>
      )}

      {activePreview ? <PreviewTable dataset={activePreview} /> : <NoPreview />}
    </div>
  );
}

function NoPreview() {
  return (
    <div className="premium-surface rounded-xl p-6 text-center text-sm text-[#5f6368]">
      No dataset uploaded yet. A preview will appear here after your CSV is selected.
    </div>
  );
}

function PreviewTable({ dataset }) {
  const rows = dataset.rows.slice(0, 8);

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28 }}
      className="premium-surface overflow-hidden rounded-xl"
    >
      <div className="flex flex-col gap-2 border-b border-[#e5e7eb] p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-bold text-[#202124]">{dataset.fileName}</h3>
          <p className="text-sm text-[#5f6368]">
            {dataset.rows.length} preview records from {dataset.sensitiveColumn || "detected groups"}
          </p>
        </div>
        <Button to="/dashboard" variant="secondary">
          View Dashboard
        </Button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-[#e5e7eb] text-left text-sm">
          <thead className="bg-[#F8FAFC] text-xs uppercase tracking-normal text-[#5f6368]">
            <tr>
              {dataset.columns.slice(0, 7).map((column) => (
                <th key={column} className="px-4 py-3 font-semibold">
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e5e7eb]">
            {rows.map((row, index) => (
              <tr key={`${dataset.fileName}-${index}`}>
                {dataset.columns.slice(0, 7).map((column) => (
                  <td key={column} className="max-w-52 truncate px-4 py-3 text-[#3c4043]">
                    {row[column] ?? "-"}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.section>
  );
}
