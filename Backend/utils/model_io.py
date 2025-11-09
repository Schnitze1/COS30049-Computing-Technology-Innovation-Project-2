import os
from typing import Dict, Any
import joblib  # type: ignore
from sklearn.base import BaseEstimator
from sklearn.ensemble import RandomForestClassifier
from sklearn.neural_network import MLPClassifier


def save_models(models: Dict[str, Any], out_dir: str = "cache/models") -> None:
    """
    Save trained models to disk using Joblib serialization.

    :param models:
        Dictionary mapping model names to model objects.
    :param out_dir:
        Directory path where models will be saved.
    :raises ValueError:
        Raised if a model type is not supported for saving.
    """
    for name, model in models.items():
        if isinstance(model, (RandomForestClassifier, MLPClassifier, BaseEstimator)):
            model_path = os.path.join(out_dir, f"{name}.joblib")
            joblib.dump(model, model_path)
        else:
            raise ValueError(f"Unsupported model type for saving: {type(model)}")


def load_model(name: str, out_dir: str = "cache/models") -> Any:
    """
    Load a trained model by name from the specified directory.

    :param name:
        Name of the model file (without extension) to load.
    :param out_dir:
        Directory path where the model file is stored.
    :return:
        Loaded model object.
    :raises FileNotFoundError:
        Raised if the specified model file does not exist.
    :raises ValueError:
        Raised if there's a version compatibility issue loading the model.
    """
    model_path = os.path.join(out_dir, f"{name}.joblib")
    if not os.path.exists(model_path):
        raise FileNotFoundError(f"Model '{name}' not found in {out_dir}")
    
    try:
        return joblib.load(model_path)
    except (ValueError, AttributeError) as e:
        if "BitGenerator" in str(e) or "numpy.random" in str(e):
            raise ValueError(
                f"Model '{name}' was saved with a different numpy version. "
                f"Please retrain the models by running: python main.py"
            ) from e
        raise


def load_models(out_dir: str = "cache/models") -> Dict[str, Any]:
    """
    Load all serialized models from the specified cache directory.

    :param out_dir:
        Directory path containing saved model files.
    :return:
        Dictionary mapping model names to loaded model objects.
    """
    models: Dict[str, Any] = {}
    if not os.path.exists(out_dir):
        return models

    for file_name in os.listdir(out_dir):
        if file_name.endswith(".joblib"):
            name = file_name[:-7]
            try:
                models[name] = load_model(name, out_dir)
            except Exception as exc:
                print(f"Warning: Could not load model '{name}': {exc}")

    return models


def list_models(out_dir: str = "cache/models") -> Dict[str, str]:
    """
    List all available serialized models in the specified directory.

    :param out_dir:
        Directory path where model files are stored.
    :return:
        Dictionary mapping model names to their framework type (e.g., 'sklearn').
    """
    if not os.path.exists(out_dir):
        return {}

    models: Dict[str, str] = {}
    for file_name in os.listdir(out_dir):
        if file_name.endswith(".joblib"):
            name = file_name[:-7]
            models[name] = "sklearn"

    return models
