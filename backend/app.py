from dotenv import load_dotenv
load_dotenv()

import os
from flask import Flask, jsonify, request
import pandas as pd
from flask_cors import CORS

app = Flask(__name__)
CORS(app)


# ---------- HOME ----------
@app.route("/")
def home():
    return "Backend is running"


# ---------- AI EXPLANATION (RULE-BASED) ----------
@app.route("/explain", methods=["POST"])
def explain():
    data = request.json

    parity = data.get("parity", 0)
    gap = data.get("approval_gap", 0)

    if parity < 0.6:
        explanation = f"""
Strong bias detected.

One group has significantly lower approval rates than others.
This usually happens due to imbalanced training data or biased features.

Fix:
- Balance dataset across groups
- Remove sensitive proxy features (like zip code)
- Apply fairness constraints in model
"""
    elif parity < 0.8:
        explanation = f"""
Moderate bias detected.

There is noticeable difference in approval rates.

Fix:
- Reweight dataset
- Tune decision thresholds
- Monitor fairness continuously
"""
    else:
        explanation = f"""
Model appears fair.

Approval rates are similar across groups.

Keep monitoring to avoid drift.
"""

    return jsonify({
        "explanation": explanation.strip(),
        "source": "rule-based"
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

        if not columns:
            return jsonify({"error": "CSV has no columns"}), 400

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

        group_rates = audit_df.groupby(sensitive_column)[target_column].mean().to_dict()
        group_rates = {str(k): float(v) for k, v in group_rates.items()}

        values = list(group_rates.values())
        min_rate = min(values)
        max_rate = max(values)

        parity = 1.0 if max_rate == 0 else min_rate / max_rate
        approval_gap = max_rate - min_rate

        fairness_score = int(round(parity * 100))
        verdict = "Biased" if parity < 0.8 else "Unbiased"

        preview_df = df.where(pd.notna(df), None)

        return jsonify({
            "columns": columns,
            "rows_preview": preview_df.head(5).to_dict(orient="records"),
            "group_rates": group_rates,
            "parity": round(parity, 4),
            "approval_gap": round(approval_gap, 4),
            "fairness_score": fairness_score,
            "verdict": verdict,
            "target_column": target_column,
            "sensitive_column": sensitive_column
        })

    except Exception as error:
        print("Upload Error:", error)
        return jsonify({"error": str(error)}), 500


# ---------- HELPER ----------
def find_sensitive_column(columns):
    sensitive = {"gender", "sex", "race", "age"}

    for col in columns:
        if col.lower() in sensitive:
            return col

    return None


# ---------- RUN ----------
if __name__ == "__main__":
    app.run(debug=True, use_reloader=False)