export async function getBiasExplanation(audit) {
  try {
    const res = await fetch("https://ethicaly.onrender.com/explain", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        parity: audit.parity,
        approval_gap: audit.approval_gap,
        group_rates: audit.group_rates
      })
    });

    const data = await res.json();

    return data.explanation;

  } catch (err) {
    console.error(err);
    return "AI explanation failed. Try again.";
  }
}