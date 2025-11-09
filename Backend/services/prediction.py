from typing import List, Optional, Tuple
from fastapi import HTTPException
from config import get_model_dir
from utils.model_io import list_models, load_model
from utils.predict import run_prediction
from .features import preprocess_input_data


def ensure_model_exists(model_name: str) -> None:
    """
    Ensure that the specified model exists in the model directory.

    :param model_name:
        Name of the model file to check.
    :raises HTTPException:
        Raised with status 404 if the model is not found.
    """
    models = list_models(out_dir=get_model_dir())
    if model_name not in models:
        raise HTTPException(
            status_code=404,
            detail={"message": f"Model '{model_name}' not found"}
        )


def predict_with_preprocessing_service(
        model_name: str,
        instances: List[List[float]]
) -> Tuple[List[int], Optional[List[List[float]]]]:
    """
    Run model predictions after preprocessing the input data.

    :param model_name:
        Name of the trained model to use for prediction.
    :param instances:
        Nested list of float values representing raw input data.
    :return:
        Tuple containing:
            - preds (List[int]): Predicted class labels.
            - proba (Optional[List[List[float]]]): Prediction probabilities,
              if available from the model.
    :raises HTTPException:
        Raised if prediction or model loading fails.
    """
    # Preprocess input data
    processed = preprocess_input_data(instances)

    # Load model from configured directory
    model = load_model(model_name, out_dir=get_model_dir())

    # Run prediction and return results
    preds, proba = run_prediction(model, processed.tolist())
    return preds, proba
