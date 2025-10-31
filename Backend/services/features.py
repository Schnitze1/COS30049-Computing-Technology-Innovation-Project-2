import pickle
from typing import List
import numpy as np
import pandas as pd
from fastapi import HTTPException


def load_selected_features_scaler():
    """
    Load the selected-features scaler used to scale input data.

    The scaler is stored in data_preprocessing/output/feature_metadata.pkl.

    :return:
        scaler (object or None): The fitted scaler object if available,
        otherwise None if loading fails.
    """
    try:
        with open("data_preprocessing/output/feature_metadata.pkl", "rb") as file:
            metadata = pickle.load(file)
        scaler = metadata.get("selected_features_scaler")
        return scaler
    except Exception as exc:
        print(f"Warning: Could not load selected features scaler: {exc}")
        return None


def preprocess_input_data(input_values: List[List[float]]) -> np.ndarray:
    """
    Preprocess input data for model inference by applying the stored scaler.

    :param input_values:
        Nested list of float values representing the raw input features.
    :return:
        scaled_features (np.ndarray): Scaled feature array ready for model inference.
        If no scaler is found, returns the raw input as a NumPy array.
    :raises HTTPException:
        Raised when an error occurs during data preprocessing.
    """
    # Load input data scaler
    selected_features_scaler = load_selected_features_scaler()

    # If no scaler is found, return raw features
    if selected_features_scaler is None:
        return np.array(input_values)

    # Preprocess input data
    try:
        # If scaler has feature names, use a DataFrame
        if hasattr(selected_features_scaler, "feature_names_in_"):
            columns = list(selected_features_scaler.feature_names_in_)
            input_df = pd.DataFrame(input_values, columns=columns)
            scaled_features = selected_features_scaler.transform(input_df)
        else:
            # Fallback: use NumPy array directly
            input_array = np.array(input_values)
            scaled_features = selected_features_scaler.transform(input_array)

        return scaled_features

    except Exception as exc:
        raise HTTPException(
            status_code=400,
            detail={"message": f"Error during data preprocessing: {exc}"}
        )