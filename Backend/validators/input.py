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
    Raise HTTPException(422) if validation fails for numeric input matrices.
    [422 Code]: Invalid data values handling even though JSON syntax is correct.   
    """
    # Validate that input_values is a non-empty list
    if not isinstance(input_values, list) or len(input_values) == 0:
        raise HTTPException(status_code=422, detail={"message": "'input_values' must be a non-empty list"})
    
    # Validate that each row in input_values is a non-empty list
    for i, row in enumerate(input_values):
        
        if not isinstance(row, list) or len(row) == 0:
            raise HTTPException(status_code=422, detail={"message": f"Row at index {i} must be a non-empty list"})
        
        # Validate that the row has the expected number of features (model was trained on 15 features => we enforce 15 features).
        if expected_num_features is not None and len(row) != expected_num_features:
            raise HTTPException(status_code=422, detail={"message": f"Row at index {i} must have {expected_num_features} features, got {len(row)}"})
        
        # Validate that each value in the row is a numeric value
        for j, x in enumerate(row):
            try:
                xv = float(x)
            except Exception:
                raise HTTPException(status_code=422, detail={"message": f"Value at [{i},{j}] must be numeric"})
            if np.isnan(xv) or np.isinf(xv):
                raise HTTPException(status_code=422, detail={"message": f"Value at [{i},{j}] must be finite (not NaN/Inf)"})
            if not allow_negative and xv < 0:
                raise HTTPException(status_code=422, detail={"message": f"Value at [{i},{j}] must be non-negative"})


