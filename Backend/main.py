"""Main module for running multiclass classification experiments."""

import os
import pickle
from typing import Tuple

import numpy as np

from evaluation.calc_eval_metrics import (
    calculate_label_metrics,
    evaluate_models,
    print_label_results,
    print_results
)
from evaluation.create_reports import export_reports
from train import train_models
from utils.model_io import load_models, save_models

DATA_PATH = 'data_preprocessing/output'


def load_dataset(npz_path: str = f'{DATA_PATH}/processed_data.npz'
                 ) -> Tuple[np.ndarray, np.ndarray, np.ndarray, np.ndarray,
                            np.ndarray]:
    """Load the processed dataset from NPZ file.

    Returns
    -------
    Tuple containing:
        X_train_unsupervised: Original training data before SMOTE
        X_train: SMOTE-augmented training data
        X_test: Test data
        y_train: Training labels
        y_test: Test labels
    """
    data = np.load(npz_path, allow_pickle=True)
    x_train_unsupervised = data['X_train_unSMOTE']
    x_train = data['X_train']
    x_test = data['X_test']
    y_train = data['y_train']
    y_test = data['y_test']
    return x_train_unsupervised, x_train, x_test, y_train, y_test


def load_feature_metadata(pickle_path: str = f'{DATA_PATH}/feature_metadata.pkl'):
    """Load feature metadata from pickle file."""
    try:
        with open(pickle_path, 'rb') as f:
            return pickle.load(f)
    except FileNotFoundError:
        return None


def run_multiclass_classification():
    """Run multiclass classification (traffic types)."""
    print("="*60)
    print("MULTICLASS CLASSIFICATION MODE")
    print("="*60)

    # Load supervised dataset
    (x_train_unsupervised, x_train_supervised, x_test,
     y_train_supervised, y_test) = load_dataset(
         f'{DATA_PATH}/processed_data.npz')

    metadata = load_feature_metadata(f'{DATA_PATH}/feature_metadata.pkl')

    if metadata is None:
        print("Error: Multiclass metadata not found. Please run preprocessing first")
        return

    # Get Traffic Type categories directly from label encoder
    traffic_types = metadata['label_encoder'].classes_
    n_classes = len(traffic_types)

    print(f"Supervised dataset (SMOTE): {x_train_supervised.size} training samples")
    print(f"Unsupervised dataset (unsmote): {x_train_unsupervised.size} training samples")
    print(f"Test dataset: {x_test.size} test samples")
    print(f"Traffic Types: {traffic_types}")

    # Try to load cached models first
    models = load_models(out_dir='cache/models')

    if not models:
        print("No cached models found. Training new models...")
        models = train_models(x_train_supervised, y_train_supervised,
                              x_train_unsupervised, n_classes)
        save_models(models, out_dir='cache/models')
        print("Models trained and saved to cache.")
    else:
        print(f"Loaded {len(models)} cached models: {list(models.keys())}")
        # Verify we have all expected models
        expected_models = ['random_forest', 'mlp', 'kmeans', 'dbscan']
        missing_models = [m for m in expected_models if m not in models]
        if missing_models:
            print(f"Missing models: {missing_models}. Training missing models...")
            # Train only missing models
            missing_models_dict = train_models(x_train_supervised,
                                               y_train_supervised,
                                               x_train_unsupervised, n_classes)
            for model_name in missing_models:
                if model_name in missing_models_dict:
                    models[model_name] = missing_models_dict[model_name]
            save_models(models, out_dir='cache/models')
            print("Missing models trained and saved to cache.")

    results = evaluate_models(models, x_test, y_test, n_classes)
    print_results(results, traffic_types)

    # Calculate Label metrics for all models
    label_metrics = calculate_label_metrics(models, x_test, y_test, traffic_types)
    print_label_results(label_metrics)

    # Export the overall summary (multiclass + clustering)
    paths = export_reports(
        results, traffic_types, label_metrics,
        models=models, x_data=x_test, y_true=y_test,
        clustering_out_dir='evaluation_reports/clustering'
    )

    print('\nMulticlass classification artifacts saved to:')
    for artifact_name, path in paths.items():
        print(f'\t{artifact_name}: {path}')


def main():
    """Main function to run the multiclass classification experiment."""
    # Create necessary directories
    directories = ['cache/models', 'evaluation_reports',
                   'evaluation_reports/multiclass',
                   'evaluation_reports/binary_label',
                   'evaluation_reports/clustering']
    for directory in directories:
        os.makedirs(directory, exist_ok=True)

    run_multiclass_classification()

    print("\nMULTICLASS CLASSIFICATION complete!")


if __name__ == "__main__":
    main()