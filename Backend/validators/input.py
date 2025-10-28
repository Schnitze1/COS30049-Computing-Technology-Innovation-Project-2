"""Input validation functions for the API."""

from typing import List, Optional
import numpy as np
from fastapi import HTTPException


def validate_input_values(
    input_values: List[List[float]],
    *,
    allow_negative: bool = False,
    expected_num_features: Optional[int] = None,
) -> None:
    """
    Validate numeric input matrices for prediction requests.
    
    Raises HTTPException(422) if validation fails.
    
    Args:
        input_values: List of feature vectors to validate
        allow_negative: Whether negative values are allowed
        expected_num_features: Expected number of features per vector
        
    Raises:
        HTTPException: If validation fails with appropriate error message
    """
    # Validate that input_values is a non-empty list
    if not isinstance(input_values, list) or len(input_values) == 0:
        raise HTTPException(
            status_code=422,
            detail={"message": "'input_values' must be a non-empty list"}
        )

    # Validate that each row in input_values is a non-empty list
    for i, row in enumerate(input_values):
        if not isinstance(row, list) or len(row) == 0:
            raise HTTPException(
                status_code=422,
                detail={"message": f"Row at index {i} must be a non-empty list"}
            )

        # Validate feature count
        if expected_num_features is not None and len(row) != expected_num_features:
            raise HTTPException(
                status_code=422,
                detail={"message": f"Row at index {i} must have {expected_num_features} features, got {len(row)}"}
            )

        # Validate that each value in the row is numeric and finite
        for j, x in enumerate(row):
            try:
                xv = float(x)
            except Exception as exc:
                raise HTTPException(
                    status_code=422,
                    detail={"message": f"Value at [{i},{j}] must be numeric"}
                ) from exc
            if np.isnan(xv) or np.isinf(xv):
                raise HTTPException(
                    status_code=422,
                    detail={"message": f"Value at [{i},{j}] must be finite (not NaN/Infinity)"}
                )
            if not allow_negative and xv < 0:
                raise HTTPException(
                    status_code=422,
                    detail={"message": f"Value at [{i},{j}] must be non-negative"}
                )
