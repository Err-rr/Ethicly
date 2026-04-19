from flask import Flask, jsonify, request
import pandas as pd
from flask_cors import CORS

app = Flask(__name__)
CORS(app)


@app.route("/")
def home():
    return "Backend is running"


@app.route("/upload", methods=["POST"])
def upload_file():
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files["file"]

    try:
        df = pd.read_csv(file)
        columns = df.columns.tolist()

        if not columns:
            return jsonify({"error": "The uploaded CSV does not contain any columns"}), 400

        target_column = columns[-1]
        sensitive_column = find_sensitive_column(columns)

        if sensitive_column is None:
            return jsonify({
                "error": "No sensitive column found. Include one of: gender, sex, race, age."
            }), 400

        target_values = pd.to_numeric(df[target_column], errors="coerce")

        if not target_values.dropna().isin([0, 1]).all():
            return jsonify({
                "error": f"Target column '{target_column}' must be binary with 0/1 values."
            }), 400

        audit_df = df[[sensitive_column]].copy()
        audit_df[target_column] = target_values
        audit_df = audit_df.dropna(subset=[sensitive_column, target_column])

        if audit_df.empty:
            return jsonify({
                "error": "No valid rows found after removing missing values."
            }), 400

        group_rates = audit_df.groupby(sensitive_column)[target_column].mean().to_dict()
        group_rates = {
            str(group): float(rate) if pd.notna(rate) else None
            for group, rate in group_rates.items()
        }

        group_distribution = audit_df[sensitive_column].value_counts(normalize=True).to_dict()
        group_distribution = {
            str(group): float(value)
            for group, value in group_distribution.items()
        }

        valid_rates = [r for r in group_rates.values() if r is not None]

        if not valid_rates:
            return jsonify({"error": "Could not calculate group approval rates."}), 400

        min_rate = min(valid_rates)
        max_rate = max(valid_rates)

        if max_rate == 0:
            parity = 1.0
            approval_gap = 0.0
        else:
            parity = min_rate / max_rate
            approval_gap = max_rate - min_rate

        fairness_score = int(round(parity * 100))

        bias_threshold = 0.8
        verdict = "Biased" if parity < bias_threshold else "Unbiased"

        preview_df = df.where(pd.notna(df), None)

        return jsonify({
            "columns": columns,
            "rows_preview": preview_df.head(5).to_dict(orient="records"),

            "group_rates": group_rates,
            "group_distribution": group_distribution,

            "parity": float(round(parity, 4)),
            "approval_gap": float(round(approval_gap, 4)),
            "fairness_score": fairness_score,
            "verdict": verdict,

            "target_column": target_column,
            "sensitive_column": sensitive_column
        })

    except Exception as error:
        return jsonify({"error": str(error)}), 500


def find_sensitive_column(columns):
    sensitive_candidates = {"gender", "sex", "race", "age"}

    for column in columns:
        if column.strip().lower() in sensitive_candidates:
            return column

    return None


if __name__ == "__main__":
    app.run(debug=True, use_reloader=False)