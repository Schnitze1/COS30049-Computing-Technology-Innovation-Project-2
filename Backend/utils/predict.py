import logging
from typing import List, Optional, Tuple
import numpy as np

logger = logging.getLogger(__name__)


def run_prediction(
        model,
        instances: List[List[float]]
) -> Tuple[List[int], Optional[List[List[float]]]]:
    """
    Run predictions using a trained model and return class indices and probabilities.

    :param model:
        Trained model object implementing `predict` and optionally `predict_proba`.
    :param instances:
        Nested list of float values representing input samples.
    :return:
        Tuple containing:
            - preds (List[int]): Predicted class indices.
            - proba (Optional[List[List[float]]]): Prediction probabilities if available.
    """
    # Convert input data to NumPy array
    X = np.array(instances, dtype=float)
    logger.debug("Converted input to numpy array with shape: %s", X.shape)

    # Handle DBSCAN models which use fit_predict instead of predict
    if hasattr(model, "__class__") and "DBSCAN" in str(type(model)):
        preds = model.fit_predict(X).tolist()
    else:
        preds = model.predict(X).tolist()

    proba = None
    # Compute probabilities if supported by the model
    if hasattr(model, "predict_proba"):
        try:
            proba_values = model.predict_proba(X)
            if isinstance(proba_values, np.ndarray):
                proba = proba_values.tolist()
        except Exception as exc:
            logger.warning("predict_proba failed: %s", exc)
            proba = None

    return preds, proba
