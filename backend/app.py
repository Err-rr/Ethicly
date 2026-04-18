from flask import Flask, request, jsonify
import pandas as pd
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route("/upload", methods=["POST"])
def upload_file():
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files["file"]

    try:
        df = pd.read_csv(file)

        columns = df.columns.tolist()

        target_column = columns[-1]

        sensitive_candidates = ["gender", "sex", "race", "age"]
        sensitive_column = None

        for col in columns:
            if col.lower() in sensitive_candidates:
                sensitive_column = col
                break

        return jsonify({
            "columns": columns,
            "target_column": target_column,
            "sensitive_column": sensitive_column,
            "rows_preview": df.head(5).to_dict(orient="records")
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(debug=True)
    