"""Service for comparing an uploaded dataset against the reference training dataset (TII-SSRC-23)."""

import logging
from pathlib import Path
from typing import BinaryIO

import pandas as pd
from fastapi import HTTPException

logger = logging.getLogger(__name__)


def compare_dataset_service(file_obj: BinaryIO) -> dict:
    """Compare a user-uploaded dataset with the reference dataset (TII-SSRC-23)."""
    try:
        # Load and normalize user dataset columns
        logger.info("Reading uploaded CSV file")
        df_user = pd.read_csv(file_obj)
        df_user.columns = [col.strip().lower() for col in df_user.columns]

        # Resolve reference dataset path relative to Backend directory
        base_dir = Path(__file__).resolve().parent.parent
        ref_path = base_dir / "data_preprocessing" / "input" / "data.csv"
        
        # Load and normalize reference dataset columns
        df_ref = pd.read_csv(ref_path)
        df_ref.columns = [col.strip().lower() for col in df_ref.columns]

        # Compare columns
        user_cols = set(df_user.columns)
        ref_cols = set(df_ref.columns)
        overlap = len(user_cols & ref_cols)
        missing_in_user = sorted(list(ref_cols - user_cols))
        extra_in_user = sorted(list(user_cols - ref_cols))

        # Compute similarity score (balanced measure)
        similarity = min(
            1.0,
            (overlap / len(ref_cols)) * 0.5
            + (
                min(len(df_user.columns), len(df_ref.columns))
                / max(len(df_user.columns), len(df_ref.columns))
            )
            * 0.5,
        )

        logger.info(
            f"Comparison complete: {overlap} matching features, "
            f"similarity score: {similarity:.3f}"
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
    except FileNotFoundError as e:
        logger.error(f"Reference dataset not found: {e}")
        raise HTTPException(
            status_code=404,
            detail=f"Reference dataset not found: {str(e)}",
        )
    except pd.errors.ParserError as e:
        logger.error(f"CSV parsing error: {e}")
        raise HTTPException(
            status_code=400,
            detail="Invalid CSV format. Please upload a valid CSV file.",
        )
    except Exception as e:
        logger.exception(f"Unexpected error during dataset comparison: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Dataset comparison failed: {str(e)}",
        )
