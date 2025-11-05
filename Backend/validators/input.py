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

    :param input_values:
        Nested list of float values representing input features.
    :param allow_negative:
        Whether negative values are permitted in the input data.
    :param expected_num_features:
        Optional expected number of features per row.
    :raises HTTPException:
        Raised with status 422 if validation fails due to:
            - Non-list input or empty input.
            - Mismatched feature count.
            - Non-numeric or invalid (NaN/Infinity) values.
            - Negative values when disallowed.
    """
    # Ensure input_values is a non-empty list
    if not isinstance(input_values, list) or len(input_values) == 0:
        raise HTTPException(
            status_code=422,
            detail={"message": "'input_values' must be a non-empty list"},
        )

    # Validate each row within the input matrix
    for i, row in enumerate(input_values):
        if not isinstance(row, list) or len(row) == 0:
            raise HTTPException(
                status_code=422,
                detail={"message": f"Row at index {i} must be a non-empty list"},
            )

        # Validate feature count if specified
        if expected_num_features is not None and len(row) != expected_num_features:
            message = (
                f"Row at index {i} must have {expected_num_features} "
                f"features, got {len(row)}"
            )
            raise HTTPException(status_code=422, detail={"message": message})

        # Validate that all values are numeric, finite, and meet sign constraints
        for j, value in enumerate(row):
            try:
                numeric_value = float(value)
            except Exception as exc:
                raise HTTPException(
                    status_code=422,
                    detail={"message": f"Value at [{i},{j}] must be numeric"},
                ) from exc

            if np.isnan(numeric_value) or np.isinf(numeric_value):
                raise HTTPException(
                    status_code=422,
                    detail={
                        "message": f"Value at [{i},{j}] must be finite (not NaN/Infinity)"
                    },
                )

            if not allow_negative and numeric_value < 0:
                raise HTTPException(
                    status_code=422,
                    detail={"message": f"Value at [{i},{j}] must be non-negative"},
                )