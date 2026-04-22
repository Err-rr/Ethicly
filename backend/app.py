from dotenv import load_dotenv
load_dotenv()

import os
from flask import Flask, jsonify, request
import pandas as pd
from flask_cors import CORS

# PDF
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
)
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch
from reportlab.graphics.shapes import Drawing, Circle
from reportlab.graphics.charts.barcharts import VerticalBarChart
from io import BytesIO
from datetime import datetime

# NEW
from scipy.stats import chi2_contingency

app = Flask(__name__)

CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)


# ---------- HOME ----------
@app.route("/")
def home():
    return "Backend is running"


# ---------- HELPER FUNCTIONS ----------

def find_sensitive_column(columns):
    sensitive = {"gender", "sex", "race", "age"}
    for col in columns:
        if col.lower() in sensitive:
            return col
    return None


def chi_square_test(df, group_col, target_col):
    contingency = pd.crosstab(df[group_col], df[target_col])
    chi2, p, dof, expected = chi2_contingency(contingency)

    return {
        "chi2": float(chi2),
        "p_value": float(p),
        "significant": p < 0.05
    }


def disparate_impact(group_rates):
    values = list(group_rates.values())
    if not values or max(values) == 0:
        return 1.0
    return min(values) / max(values)


# ---------- AI EXPLANATION ----------
@app.route("/explain", methods=["POST"])
def explain():
    data = request.json

    parity = data.get("parity", 0)
    p_value = data.get("p_value", 1)

    if p_value < 0.05 and parity < 0.8:
        explanation = """
Statistically significant bias detected.

Differences in approval rates are unlikely due to chance.

Fix:
- Rebalance dataset
- Remove proxy features
- Apply fairness-aware models
"""
    elif parity < 0.8:
        explanation = """
Potential bias detected.

Differences exist but are not statistically significant.

Fix:
- Collect more data
- Monitor fairness metrics
"""
    else:
        explanation = """
Model appears fair.

No statistically significant bias detected.
"""

    return jsonify({
        "explanation": explanation.strip(),
        "source": "statistical + rule-based"
    })


# ---------- CSV UPLOAD ----------
@app.route("/upload", methods=["POST"])
def upload_file():

    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files["file"]

    try:
        df = pd.read_csv(file)
        columns = df.columns.tolist()

        target_column = columns[-1]
        sensitive_column = find_sensitive_column(columns)

        if not sensitive_column:
            return jsonify({"error": "Add gender/sex/race/age column"}), 400

        target_values = pd.to_numeric(df[target_column], errors="coerce")

        if not target_values.dropna().isin([0, 1]).all():
            return jsonify({"error": "Target must be 0/1"}), 400

        audit_df = df[[sensitive_column]].copy()
        audit_df[target_column] = target_values
        audit_df = audit_df.dropna()

        if audit_df.empty:
            return jsonify({"error": "No valid rows"}), 400

        # -------- GROUP RATES --------
        group_rates = audit_df.groupby(sensitive_column)[target_column].mean().to_dict()
        group_rates = {str(k): float(v) for k, v in group_rates.items()}

        values = list(group_rates.values())
        min_rate = min(values)
        max_rate = max(values)

        parity = 1.0 if max_rate == 0 else min_rate / max_rate
        approval_gap = max_rate - min_rate

        # -------- NEW: STATS --------
        chi_result = chi_square_test(audit_df, sensitive_column, target_column)
        p_value = chi_result["p_value"]

        dir_ratio = disparate_impact(group_rates)

        # -------- VERDICT --------
        if p_value < 0.05 and parity < 0.8:
            verdict = "Biased (Statistically Significant)"
        elif parity < 0.8:
            verdict = "Potential Bias"
        else:
            verdict = "Fair"

        fairness_score = int(round(parity * 100))

        preview_df = df.where(pd.notna(df), None)

        return jsonify({
            "columns": columns,
            "rows_preview": preview_df.head(5).to_dict(orient="records"),

            "group_rates": {k: float(v) for k, v in group_rates.items()},
            "parity": float(round(parity, 4)),
            "approval_gap": float(round(approval_gap, 4)),
            "fairness_score": int(fairness_score),

            "p_value": float(round(p_value, 6)),
            "statistical_significance": bool(chi_result["significant"]),
            "disparate_impact_ratio": float(round(dir_ratio, 4)),

            "verdict": str(verdict),

            "target_column": str(target_column),
            "sensitive_column": str(sensitive_column)
        })

    except Exception as error:
        return jsonify({"error": str(error)}), 500


# ---------- DOWNLOAD REPORT ----------
@app.route("/download-report", methods=["POST", "OPTIONS"])
def download_report():

    if request.method == "OPTIONS":
        return '', 200

    data = request.json

    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter)

    styles = getSampleStyleSheet()
    content = []

    from reportlab.graphics.shapes import Drawing, Circle, String, Rect
    from reportlab.lib import colors
    from reportlab.platypus import Table, TableStyle, Paragraph, Spacer
    from reportlab.graphics.charts.barcharts import VerticalBarChart

    header = Drawing(500, 60)

    header.add(Rect(10, 10, 40, 40, rx=10, ry=10, fillColor=colors.white, strokeColor=colors.HexColor("#dadce0")))

    header.add(Circle(30, 36, 6, fillColor=colors.HexColor("#4285F4"), strokeColor=None))
    header.add(Circle(36, 30, 6, fillColor=colors.HexColor("#34A853"), strokeColor=None))
    header.add(Circle(24, 30, 6, fillColor=colors.HexColor("#FBBC05"), strokeColor=None))
    header.add(Circle(30, 24, 6, fillColor=colors.HexColor("#EA4335"), strokeColor=None))

    header.add(String(60, 36, "Ethicly", fontSize=16, fontName="Helvetica-Bold", fillColor=colors.black))
    header.add(String(60, 20, "Detect, Explain, and Fix AI Bias", fontSize=10, fillColor=colors.black))

    content.append(header)
    content.append(Spacer(1, 14))

    table_data = [
        ["Metric", "Value"],
        ["Fairness Score", f"{data['fairness_score']}/100"],
        ["Parity", str(data["parity"])],
        ["Approval Gap", str(data["approval_gap"])],
        ["P-Value", str(data.get("p_value", "N/A"))],
        ["Statistical Significance", str(data.get("statistical_significance", "N/A"))],
        ["Disparate Impact Ratio", str(data.get("disparate_impact_ratio", "N/A"))],
    ]

    table = Table(table_data, colWidths=[260, 200])

    table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#4285F4")),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("BACKGROUND", (0, 1), (-1, -1), colors.whitesmoke),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
    ]))

    content.append(table)
    content.append(Spacer(1, 18))

    verdict = data.get("verdict", "Unknown")
    color = colors.red if "Biased" in verdict else colors.green

    content.append(Paragraph(
        f"<b>Verdict:</b> <font color='{color.hexval()}'>{verdict}</font>",
        styles["Heading2"]
    ))

    content.append(Spacer(1, 18))

    drawing = Drawing(450, 240)
    bc = VerticalBarChart()

    bc.x = 50
    bc.y = 60
    bc.height = 140
    bc.width = 320

    groups = list(data["group_rates"].keys())
    values = [v * 100 for v in data["group_rates"].values()]

    bc.data = [values]
    bc.categoryAxis.categoryNames = groups

    bc.valueAxis.valueMin = 0
    bc.valueAxis.valueMax = 100
    bc.valueAxis.valueStep = 20

    bc.bars[0].fillColor = colors.HexColor("#4285F4")

    drawing.add(bc)
    drawing.add(String(120, 210, "Approval Rate by Group (%)", fontSize=12))

    content.append(drawing)
    content.append(Spacer(1, 12))

    parity = data.get("parity", 0)

    if parity < 0.6:
        explanation = "Significant disparity detected. One or more groups receive much lower approvals."
        fix = "Balance dataset, remove proxy features, and apply fairness-aware training."
    elif parity < 0.8:
        explanation = "Moderate disparity observed across groups."
        fix = "Reweight samples, adjust thresholds, and monitor fairness metrics."
    else:
        explanation = "No significant disparity detected. Approval rates are consistent across groups."
        fix = "Continue monitoring the model to prevent future bias."

    content.append(Paragraph(f"<b>Analysis:</b> {explanation}", styles["Normal"]))
    content.append(Spacer(1, 8))
    content.append(Paragraph(f"<b>Recommendation:</b> {fix}", styles["Normal"]))

    content.append(Spacer(1, 30))

    content.append(Paragraph(
        f"<para alignment='right'><font size=8 color='#5f6368'>Generated: {datetime.now().strftime('%d %b %Y, %H:%M')}</font></para>",
        styles["Normal"]
    ))

    doc.build(content)
    buffer.seek(0)

    return (
        buffer.read(),
        200,
        {
            "Content-Type": "application/pdf",
            "Content-Disposition": "attachment; filename=ethicly_report.pdf",
        },
    )


# ---------- RUN ----------
if __name__ == "__main__":
    app.run(debug=True, use_reloader=False)