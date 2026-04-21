export async function downloadReport(audit) {
  try {
    const res = await fetch("http://127.0.0.1:5000/download-report", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(audit)
    });

    if (!res.ok) {
      throw new Error("Failed to generate report");
    }

    const blob = await res.blob();

    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");

    a.href = url;
    a.download = "ethicly_report.pdf";

    document.body.appendChild(a);
    a.click();
    a.remove();

  } catch (err) {
    console.error(err);
    alert("Download failed");
  }
}