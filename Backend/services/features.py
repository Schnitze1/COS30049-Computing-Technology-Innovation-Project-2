from typing import Optional, List
import pickle
import numpy as np
import pandas as pd
from fastapi import HTTPException

def load_selected_features_scaler():
    """ Load the selected features scaler to scale input data for model inference (data_preprocessing/output/feature_metadata.pkl). """
    try:
        with open('data_preprocessing/output/feature_metadata.pkl', 'rb') as f:
            metadata = pickle.load(f)
        scaler = metadata.get('selected_features_scaler')
        return scaler
    except Exception as e:
        print(f"Warning: Could not load selected features scaler: {e}")
        return None

def preprocess_input_data(input_values: List[List[float]]) -> np.ndarray:
    """ Preprocess input data for model inference. """
    # Load input data scaler
    selected_features_scaler = load_selected_features_scaler()
    
    # If no scaler is found, return raw features
    if selected_features_scaler is None:
        return np.array(input_values)
    
    # Preprocess input data
    try:
        # Create a DataFrame if scaler has feature names
        if hasattr(selected_features_scaler, 'feature_names_in_'):
            cols = list(selected_features_scaler.feature_names_in_)
            input_df = pd.DataFrame(input_values, columns=cols)
            scaled_features = selected_features_scaler.transform(input_df)
        # No need to create a DataFrame if scaler has no feature names
        else:
            input_array = np.array(input_values)
            scaled_features = selected_features_scaler.transform(input_array)   
        return scaled_features
    except Exception as e:
        raise HTTPException(status_code=400, detail={"message": f"Error during data preprocessing: {e}"})
