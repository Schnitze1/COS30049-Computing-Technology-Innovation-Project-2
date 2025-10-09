import os
from evaluation.create_reports import export_reports
import numpy as np
import pickle
from utils.model_io import save_models, load_models
from train import train_models
from evaluation.calc_eval_metrics import evaluate_models, print_results, calculate_label_metrics, print_label_results
DATA_PATH = 'data_preprocessing/output'

def load_dataset(npz_path: str = f'{DATA_PATH}/processed_data.npz'):
    data = np.load(npz_path, allow_pickle=True)
    X_train_unsupervised = data['X_train_unSMOTE']  # Original X_train before SMOTE for unsupervised learning
    X_train = data['X_train']
    X_test = data['X_test']
    y_train = data['y_train']
    y_test = data['y_test']
    return X_train_unsupervised, X_train, X_test, y_train, y_test


def load_feature_metadata(pickle_path: str = f'{DATA_PATH}/feature_metadata.pkl'):
	try:
		with open(pickle_path, 'rb') as f:
			return pickle.load(f)
	except FileNotFoundError:
		return None


def run_multiclass_classification():
    """Run multiclass classification (traffic types)"""
    print("="*60)
    print("MULTICLASS CLASSIFICATION MODE")
    print("="*60)
    
    # Load supervised dataset (SMOTE-augmented for supervised models, raw samples for unsupervised models)
    X_train_unsupervised, X_train_supervised, X_test, y_train_supervised, y_test = load_dataset(f'{DATA_PATH}/processed_data.npz')
    
    metadata = load_feature_metadata(f'{DATA_PATH}/feature_metadata.pkl')
    
    if metadata is None:
        print("Error: Multiclass metadata not found. Please run preprocessing first")
        return
    
    # Get Traffic Type categories directly from label encoder
    traffic_types = metadata['label_encoder'].classes_
    n_classes = len(traffic_types)
    
    print(f"Supervised dataset (SMOTE): {X_train_supervised.size} training samples")
    print(f"Unsupervised dataset (unsmote): {X_train_unsupervised.size} training samples")
    print(f"Test dataset: {X_test.size} test samples")
    print(f"Traffic Types: {traffic_types}")
    
    # Try to load cached models first
    models = load_models(out_dir='cache/models')
    
    if not models:
        print("No cached models found. Training new models...")
        models = train_models(X_train_supervised, y_train_supervised, X_train_unsupervised, n_classes)
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
            missing_models_dict = train_models(X_train_supervised, y_train_supervised, X_train_unsupervised, n_classes)
            for model_name in missing_models:
                if model_name in missing_models_dict:
                    models[model_name] = missing_models_dict[model_name]
            save_models(models, out_dir='cache/models')
            print("Missing models trained and saved to cache.")
    
    results = evaluate_models(models, X_test, y_test, n_classes)
    print_results(results, traffic_types)
    
    # Calculate Label metrics for all models
    label_metrics = calculate_label_metrics(models, X_test, y_test, traffic_types)
    print_label_results(label_metrics)
    
    # Export the overall summary (multiclass + clustering)
    paths = export_reports(
        results, traffic_types, label_metrics,
        models=models, X=X_test, y_true=y_test,
        clustering_out_dir='evaluation_reports/clustering'
    )

    print('\nMulticlass classification artifacts saved to:')
    for artifact_name, path in paths.items():
        print(f'\t{artifact_name}: {path}')

def main():
    # Create necessary directories
    for dir in ['cache/models', 'evaluation_reports', 'evaluation_reports/multiclass', 'evaluation_reports/binary_label', 'evaluation_reports/clustering']:
        os.makedirs(dir, exist_ok=True)
    
    run_multiclass_classification()
    
    print(f"\nMULTICLASS CLASSIFICATION complete!")

if __name__ == "__main__":
    main()