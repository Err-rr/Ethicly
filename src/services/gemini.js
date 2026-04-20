export async function getBiasExplanation(audit) {
  try {
    const res = await fetch("http://127.0.0.1:5000/explain", {
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