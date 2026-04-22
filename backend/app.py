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

    # LOGO
    logo = Drawing(60, 40)
    logo.add(Circle(30, 25, 6, fillColor=colors.HexColor("#4285F4")))
    logo.add(Circle(42, 25, 6, fillColor=colors.HexColor("#34A853")))
    logo.add(Circle(18, 25, 6, fillColor=colors.HexColor("#FBBC05")))
    logo.add(Circle(30, 13, 6, fillColor=colors.HexColor("#EA4335")))

    content.append(logo)
    content.append(Spacer(1, 6))

    # HEADER
    content.append(Paragraph("<b>Ethicly Fairness Report</b>", styles["Title"]))
    content.append(Spacer(1, 10))

    content.append(Paragraph(
        f"Generated: {datetime.now().strftime('%d %b %Y, %H:%M')}",
        styles["Normal"]
    ))

    content.append(Spacer(1, 12))

    # TABLE
    table_data = [
        ["Metric", "Value"],
        ["Fairness Score", f"{data['fairness_score']}/100"],
        ["Parity", str(data["parity"])],
        ["Approval Gap", str(data["approval_gap"])],
        ["P-Value", str(data["p_value"])],
        ["Statistical Significance", str(data["statistical_significance"])],
        ["Disparate Impact Ratio", str(data["disparate_impact_ratio"])],
    ]

    table = Table(table_data)
    table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#4285F4")),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
    ]))

    content.append(table)
    content.append(Spacer(1, 20))

    # VERDICT
    color = "red" if "Biased" in data["verdict"] else "green"
    content.append(Paragraph(
        f"<b>Verdict:</b> <font color='{color}'>{data['verdict']}</font>",
        styles["Heading2"]
    ))

    content.append(Spacer(1, 20))

    # GRAPH
    drawing = Drawing(400, 200)
    bc = VerticalBarChart()
    bc.x = 50
    bc.y = 40
    bc.height = 120
    bc.width = 300

    groups = list(data["group_rates"].keys())
    values = [v * 100 for v in data["group_rates"].values()]

    bc.data = [values]
    bc.categoryAxis.categoryNames = groups
    bc.bars[0].fillColor = colors.HexColor("#4285F4")

    drawing.add(bc)
    content.append(drawing)

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