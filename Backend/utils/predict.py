from typing import List, Optional, Tuple
import numpy as np


def run_prediction(model, instances: List[List[float]]) -> Tuple[List[int], Optional[List[float]]]:
	X = np.array(instances, dtype=float)
	preds = model.predict(X).tolist()
	proba = None
	if hasattr(model, 'predict_proba'):
		proba_vals = model.predict_proba(X)
		if isinstance(proba_vals, np.ndarray) and proba_vals.ndim == 2 and proba_vals.shape[1] >= 2:
			proba = proba_vals[:, 1].tolist()
		elif isinstance(proba_vals, np.ndarray) and proba_vals.ndim == 1:
			proba = proba_vals.tolist()
	return preds, proba


