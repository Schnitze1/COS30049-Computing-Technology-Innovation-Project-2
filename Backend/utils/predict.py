from typing import List, Optional, Tuple
import numpy as np

def run_prediction(model, instances: List[List[float]]) -> Tuple[List[int], Optional[List[List[float]]]]:
	"""
    Run prediction and return:
      - preds: list[int] (class indices)
      - proba: Optional[List[List[float]]] (shape: n_samples x n_classes) when predict_proba exists

    This function:
      - converts instances to a numpy array
      - if model expects a specific number of features, it DOES NOT try to pad/trim here.
        (If desired, padding can be added earlier in the pipeline.)
      - returns full predict_proba matrix (converted to python lists) when available.
    """
	X = np.array(instances, dtype=float)
	
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
			print(f"[WARN] predict_proba failed: {e}")
			proba = None

	return preds, proba