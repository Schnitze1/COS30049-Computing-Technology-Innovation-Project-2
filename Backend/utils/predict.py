from typing import List, Optional, Tuple
import numpy as np
import logging

logger = logging.getLogger(__name__)

def run_prediction(model, instances: List[List[float]]) -> Tuple[List[int], Optional[List[List[float]]]]:
	"""
    Run prediction and return:
        - preds: list[int] (class indices)
        - proba: Optional[List[List[float]]] (shape: n_samples x n_classes) when predict_proba exists

    This function:
        - converts instances to a numpy array
        - returns full predict_proba matrix (converted to python lists).
    """
	X = np.array(instances, dtype=float)
	logger.debug(f"Converted input to numpy array with shape: {X.shape}")
	
	# Use fit_predict for DBSCAN since it doesn't have a predict method
	if hasattr(model, '__class__') and 'DBSCAN' in str(type(model)):
		preds = model.fit_predict(X).tolist()
	else:
		# Standard predict for other models
		preds = model.predict(X).tolist()

	proba = None
	if hasattr(model, "predict_proba"):
		try:
			proba_vals = model.predict_proba(X)
			if isinstance(proba_vals, np.ndarray):
				proba = proba_vals.tolist()
		except Exception as e:
			logger.warning(f"Predict_proba failed: {e}")
			proba = None

	return preds, proba