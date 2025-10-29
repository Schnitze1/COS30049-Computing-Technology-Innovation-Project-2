from fastapi import HTTPException
from pathlib import Path
import pandas as pd
from typing import BinaryIO

def compare_dataset(file_obj: BinaryIO) -> dict:
    """ Compare a dataset file with the training dataset (TII-SSRC-23). """
    try:
        df_user = pd.read_csv(file_obj)
        df_user.columns = [col.strip().lower() for col in df_user.columns]
        base_dir = Path(__file__).resolve().parent
        ref_path = base_dir / "data_preprocessing" / "input" / "data.csv"
        if not ref_path.exists():
            raise HTTPException(
                status_code=404,
                detail={"message": f"Reference dataset not found at {ref_path}"}
            )
        df_ref = pd.read_csv(ref_path)
        df_ref.columns = [col.strip().lower() for col in df_ref.columns]
        user_cols = set(df_user.columns)
        ref_cols = set(df_ref.columns)
        overlap = len(user_cols & ref_cols)
        missing_in_user = sorted(list(ref_cols - user_cols))
        extra_in_user = sorted(list(user_cols - ref_cols))
        similarity = min(
            1.0,
            (overlap / len(ref_cols)) * 0.5
            + (min(len(df_user.columns), len(df_ref.columns)) / max(len(df_user.columns), len(df_ref.columns))) * 0.5,
        )
        return {
            "reference_dataset": "TII-SSRC-23",
            "records_uploaded": len(df_user),
            "features_uploaded": len(df_user.columns),
            "matching_features": overlap,
            "similarity_score": round(similarity, 3),
            "missing_features": missing_in_user,
            "extra_features": extra_in_user,
        }
    except pd.errors.ParserError:
        raise HTTPException(status_code=400, detail={"message": "Invalid CSV format. Please upload a valid CSV file."})
    except Exception as e:
        raise HTTPException(status_code=500, detail={"message": f"Dataset comparison failed: {e}"})