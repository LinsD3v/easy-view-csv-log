from flask import Flask, request, jsonify, render_template
from datetime import datetime
import pandas as pd

from state import STATE
from adapters.m_verginia import parse_m_verginia

app = Flask(__name__)


@app.route("/live", methods=["GET"])
def live():
    return jsonify({"message": "Servidor online"})


@app.route("/csv/upload", methods=["POST"])
def upload_csv():

    file = request.files.get("file")

    if not file:
        return jsonify({
            "error": "Nenhum arquivo enviado"
        }), 400

    try:

        # leitura do CSV
        df = pd.read_csv(
            file,
            sep=";",
            encoding="latin-1",
            dtype=str
        )

        # adapter
        parsed_df = parse_m_verginia(df)
        
        # extrai periodo do log
        first_record = parsed_df["mixed_at"].min()
        last_record = parsed_df["mixed_at"].max()

        # salva em memória
        STATE["dataframe"] = parsed_df
        STATE["machine_type"] = "m_verginia"
        STATE["uploaded_at"] = datetime.now()
        STATE["log_period"] = {
            "start": first_record,
            "end": last_record
        }

        return jsonify({
            "message": "CSV carregado com sucesso",
            "rows": len(parsed_df),
            "columns": list(parsed_df.columns),
            "uploaded_at": STATE["uploaded_at"].isoformat(),
        
            "log_period": {
                "start": (
                    STATE["log_period"]["start"].isoformat()
                    if STATE["log_period"]["start"] is not None
                    else None
                ),
        
                "end": (
                    STATE["log_period"]["end"].isoformat()
                    if STATE["log_period"]["end"] is not None
                    else None
                )
            }
        })

    except Exception as e:
        return jsonify({
            "error": str(e)
        }), 500


@app.route("/csv/info", methods=["GET"])
def csv_info():

    df = STATE["dataframe"]

    if df is None:
        return jsonify({
            "error": "Nenhum CSV carregado"
        }), 404

    return jsonify({
        "rows": len(df),

        "columns": list(df.columns),

        "machine_type": STATE["machine_type"],

        "uploaded_at": (
            STATE["uploaded_at"].isoformat()
            if STATE["uploaded_at"] is not None
            else None
        ),

        "log_period": {
            "start": (
                STATE["log_period"]["start"].isoformat()
                if STATE["log_period"]["start"] is not None
                else None
            ),

            "end": (
                STATE["log_period"]["end"].isoformat()
                if STATE["log_period"]["end"] is not None
                else None
            )
        }
    })
    
@app.route("/csv/search/product", methods=["GET"])
def search_product():

    query = request.args.get("query", "").lower()

    df = STATE["dataframe"]

    if df is None:
        return jsonify({
            "error": "Nenhum CSV carregado"
        }), 404

    if not query:
        return jsonify({
            "error": "Query vazia"
        }), 400

    results = df[
        df["product_name"]
        .str.lower()
        .str.contains(query, na=False)
    ]

    results = results.copy()

    results["mixed_at"] = results["mixed_at"].astype(str)
    results["date"] = results["date"].astype(str)
    results["time"] = results["time"].astype(str)

    return jsonify({
        "count": len(results),
        "results": results.head(50).to_dict(orient="records")
    })

@app.route("/csv/clear", methods=["POST"])
def clear_csv():

    STATE["dataframe"] = None
    STATE["machine_type"] = None
    STATE["uploaded_at"] = None
    STATE["log_period"] = None

    return jsonify({
        "message": "CSV removido com sucesso"
    })

# ====== debug_routes ======

@app.route("/csv/debug/products")
def debug_products():

    df = STATE["dataframe"]

    if df is None:
        return jsonify({
            "error": "Nenhum CSV carregado"
        }), 404

    products = (
        df["product_name"]
        .value_counts()
        .head(100)
        .to_dict()
    )

    return jsonify(products)

# ===================== frontend =====================

@app.route("/")
def index():
    return render_template("index.html")

if __name__ == "__main__":
    app.run(debug=True)