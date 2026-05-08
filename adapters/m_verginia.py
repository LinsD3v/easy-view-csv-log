import pandas as pd

INVALID_PRODUCTS = [
    "LATEXOR Fosco",
    ""
]

VALID_UNITS = [
    "L",
    "KG"
]

def parse_m_verginia(df: pd.DataFrame) -> pd.DataFrame:

    # normaliza nomes das colunas
    df.columns = [
        c.strip()
        for c in df.columns
    ]

    # remove registros sem produto
    df = df[
        df["ProductCode"].notna()
    ]

    # remove espaços
    df["ProductCode"] = (
        df["ProductCode"]
        .astype(str)
        .str.strip()
    )

    # remove produtos inválidos
    df = df[
        ~df["ProductCode"]
        .isin(INVALID_PRODUCTS)
    ]

    # dataframe padronizado
    parsed = pd.DataFrame({
        "machine_code": df["MachineCode"],

        "mixed_at": pd.to_datetime(
            df["ColorMixingTime"],
            errors="coerce"
        ),

        "base_code": df["BasePaintCode"],

        "product_name": df["ProductCode"],
    })

    # campos derivados
    parsed["date"] = (
        parsed["mixed_at"]
        .dt.strftime("%Y-%m-%d")
    )

    parsed["time"] = (
        parsed["mixed_at"]
        .dt.strftime("%H:%M:%S")
    )

    return parsed.fillna("")