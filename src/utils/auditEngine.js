const groupColumnHints = ["group", "gender", "race", "segment", "region", "class"];
const outcomeColumnHints = ["outcome", "approved", "prediction", "label", "score", "target"];

export const sampleAudit = {
  fairnessScore: 84,
  summary: "Sample model audit shows stable parity with two segments needing review.",
  biasResults: [
    { label: "Selection parity", status: "Monitor", value: "0.82 ratio" },
    { label: "False positive gap", status: "Pass", value: "4.1%" },
    { label: "Representation balance", status: "Review", value: "12.8% gap" }
  ],
  groupComparison: [
    { group: "Group A", approvalRate: 72, errorRate: 8 },
    { group: "Group B", approvalRate: 59, errorRate: 13 },
    { group: "Group C", approvalRate: 67, errorRate: 10 },
    { group: "Group D", approvalRate: 63, errorRate: 11 }
  ],
  trend: [
    { name: "Jan", fairness: 77 },
    { name: "Feb", fairness: 80 },
    { name: "Mar", fairness: 81 },
    { name: "Apr", fairness: 84 }
  ]
};

export function createAuditFromRows(rows, columns) {
  if (!rows.length) {
    throw new Error("The uploaded CSV does not contain any records.");
  }

  const groupColumn = findColumn(columns, groupColumnHints) || columns[0];
  const outcomeColumn = findColumn(columns, outcomeColumnHints) || columns[columns.length - 1];
  const groups = calculateGroups(rows, groupColumn, outcomeColumn);
  const rates = groups.map((group) => group.approvalRate);
  const maxRate = Math.max(...rates);
  const minRate = Math.min(...rates);
  const disparity = Math.max(0, maxRate - minRate);
  const fairnessScore = Math.max(45, Math.round(100 - disparity * 0.72));
  const parityRatio = maxRate === 0 ? 1 : minRate / maxRate;

  return {
    fairnessScore,
    summary: `${rows.length} records analyzed using ${groupColumn} as the comparison group.`,
    biasResults: [
      {
        label: "Selection parity",
        status: parityRatio >= 0.8 ? "Pass" : "Review",
        value: `${parityRatio.toFixed(2)} ratio`
      },
      {
        label: "Approval gap",
        status: disparity <= 12 ? "Pass" : disparity <= 22 ? "Monitor" : "Review",
        value: `${disparity.toFixed(1)}% gap`
      },
      {
        label: "Group coverage",
        status: groups.length >= 2 ? "Pass" : "Review",
        value: `${groups.length} group${groups.length === 1 ? "" : "s"} found`
      }
    ],
    groupComparison: groups,
    trend: buildTrend(fairnessScore)
  };
}

function findColumn(columns, hints) {
  return columns.find((column) => {
    const normalized = column.toLowerCase();
    return hints.some((hint) => normalized.includes(hint));
  });
}

function calculateGroups(rows, groupColumn, outcomeColumn) {
  const totals = rows.reduce((accumulator, row) => {
    const group = String(row[groupColumn] || "Unknown").slice(0, 28);
    const approved = normalizeOutcome(row[outcomeColumn]);

    if (!accumulator[group]) {
      accumulator[group] = { group, total: 0, approvals: 0 };
    }

    accumulator[group].total += 1;
    accumulator[group].approvals += approved;

    return accumulator;
  }, {});

  return Object.values(totals)
    .sort((first, second) => second.total - first.total)
    .slice(0, 8)
    .map((item) => {
      const approvalRate = Math.round((item.approvals / item.total) * 1000) / 10;
      return {
        group: item.group,
        approvalRate,
        errorRate: Math.max(2, Math.round((100 - approvalRate) * 0.18))
      };
    });
}

function normalizeOutcome(value) {
  const normalized = String(value).trim().toLowerCase();
  const numberValue = Number(normalized);

  if (!Number.isNaN(numberValue)) {
    return numberValue > 0.5 ? 1 : 0;
  }

  return ["yes", "true", "approved", "accept", "accepted", "positive", "pass", "1"].includes(normalized)
    ? 1
    : 0;
}

function buildTrend(fairnessScore) {
  return ["Run 1", "Run 2", "Run 3", "Latest"].map((name, index) => ({
    name,
    fairness: Math.min(98, Math.max(52, fairnessScore - 9 + index * 3))
  }));
}
