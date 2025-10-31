import os
import pickle
from typing import Tuple
import numpy as np
from evaluation.calc_eval_metrics import (
    calculate_label_metrics,
    evaluate_models,
    print_label_results,
    print_results,
)
from evaluation.create_reports import export_reports
from train import train_models
from utils.model_io import load_models, save_models


"""Main module for running multiclass classification experiments."""

# Directory paths
DATA_PATH = "data_preprocessing/output"


def load_dataset(
        npz_path: str = f"{DATA_PATH}/processed_data.npz",
) -> Tuple[np.ndarray, np.ndarray, np.ndarray, np.ndarray, np.ndarray]:
    """
    Load the processed dataset from a NumPy NPZ file.

    :param npz_path: Path to the preprocessed NPZ dataset file.
    :return:
        X_train_unsupervised: Original training data before SMOTE augmentation.
        X_train: SMOTE-augmented training data.
        X_test: Test dataset.
        y_train: Training labels.
        y_test: Test labels.
    """
    data = np.load(npz_path, allow_pickle=True)

    x_train_unsupervised = data["X_train_unSMOTE"]
    x_train = data["X_train"]
    x_test = data["X_test"]
    y_train = data["y_train"]
    y_test = data["y_test"]

    return x_train_unsupervised, x_train, x_test, y_train, y_test


def load_feature_metadata(pickle_path: str = f"{DATA_PATH}/feature_metadata.pkl"):
    """
    Load feature metadata from a pickle file.

    :param pickle_path: Path to the feature metadata pickle file.
    :return: Dictionary containing feature metadata or None if file not found.
    """
    try:
        with open(pickle_path, "rb") as file:
            return pickle.load(file)
    except FileNotFoundError:
        return None


def run_multiclass_classification():
    """
    Run multiclass classification for traffic type prediction.

    This function loads datasets and metadata, initializes or loads
    classification and clustering models, evaluates model performance,
    and exports the results and metrics reports.

    :return: None
    """
    print("=" * 60)
    print("MULTICLASS CLASSIFICATION MODE")
    print("=" * 60)

    # Load supervised and unsupervised datasets
    (
        x_train_unsupervised,
        x_train_supervised,
        x_test,
        y_train_supervised,
        y_test,
    ) = load_dataset(f"{DATA_PATH}/processed_data.npz")

    metadata = load_feature_metadata(f"{DATA_PATH}/feature_metadata.pkl")

    if metadata is None:
        print("Error: Multiclass metadata not found. Please run preprocessing first.")
        return

    # Extract traffic type classes from label encoder
    traffic_types = metadata["label_encoder"].classes_
    n_classes = len(traffic_types)

    # Dataset summary
    print(f"Supervised dataset (SMOTE): {x_train_supervised.size} training samples")
    print(f"Unsupervised dataset (UnSMOTE): {x_train_unsupervised.size} training samples")
    print(f"Test dataset: {x_test.size} test samples")
    print(f"Traffic Types: {traffic_types}")

    # Attempt to load pre-trained models from cache
    models = load_models(out_dir="cache/models")

    # Train models if not cached
    if not models:
        print("No cached models found. Training new models...")
        models = train_models(
            x_train_supervised,
            y_train_supervised,
            x_train_unsupervised,
            n_classes,
        )
        save_models(models, out_dir="cache/models")
        print("Models trained and saved to cache.")
    else:
        print(f"Loaded {len(models)} cached models: {list(models.keys())}")

        # Check for missing expected models
        expected_models = ["random_forest", "mlp", "kmeans", "dbscan"]
        missing_models = [m for m in expected_models if m not in models]

        if missing_models:
            print(f"Missing models: {missing_models}. Training missing models...")
            missing_models_dict = train_models(
                x_train_supervised,
                y_train_supervised,
                x_train_unsupervised,
                n_classes,
            )

            for model_name in missing_models:
                if model_name in missing_models_dict:
                    models[model_name] = missing_models_dict[model_name]

            save_models(models, out_dir="cache/models")
            print("Missing models trained and saved to cache.")

    # Evaluate trained or loaded models
    results = evaluate_models(models, x_test, y_test, n_classes)
    print_results(results, traffic_types)

    # Calculate and display label-based evaluation metrics
    label_metrics = calculate_label_metrics(models, x_test, y_test, traffic_types)
    print_label_results(label_metrics)

    # Export evaluation reports and artifacts
    paths = export_reports(
        results,
        traffic_types,
        label_metrics,
        models=models,
        x_data=x_test,
        y_true=y_test,
        clustering_out_dir="evaluation_reports/clustering",
    )

    # Display artifact save locations
    print("\nMulticlass classification artifacts saved to:")
    for artifact_name, path in paths.items():
        print(f"\t{artifact_name}: {path}")


def main():
    """
    Main function for executing the multiclass classification pipeline.

    Creates required directories, runs the classification experiment,
    and confirms completion in the console.

    :return: None
    """
    # Ensure necessary directories exist
    directories = [
        "cache/models",
        "evaluation_reports",
        "evaluation_reports/multiclass",
        "evaluation_reports/binary_label",
        "evaluation_reports/clustering",
    ]

    for directory in directories:
        os.makedirs(directory, exist_ok=True)

    run_multiclass_classification()

    print("\nMULTICLASS CLASSIFICATION complete!")


if __name__ == "__main__":
    main()