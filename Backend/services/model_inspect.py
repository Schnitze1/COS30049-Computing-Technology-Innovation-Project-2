from config import get_model_dir
from fastapi import HTTPException
from utils.model_io import list_models, load_model


def model_architecture_service(model_name: str, top_k: int = 5) -> dict:
    """
    Retrieve the architecture details of a trained neural network model.

    :param model_name:
        Name of the model file to inspect.
    :param top_k:
        Number of top-weighted connections (by absolute value) to include per neuron.
    :return:
        dict: A dictionary containing model metadata, including layer dimensions,
        connection weights, and activation details.
    :raises HTTPException:
        - 404: If the specified model is not found.
        - 400: If the model does not have an accessible architecture.
    """
    # Retrieve all available models
    models = list_models(out_dir=get_model_dir())

    # Ensure the requested model exists
    if model_name not in models:
        raise HTTPException(
            status_code=404,
            detail={"message": f"Model '{model_name}' not found"}
        )

    # Load the selected model
    model = load_model(model_name, out_dir=get_model_dir())

    # Verify that the model has accessible architecture coefficients
    if not hasattr(model, "coefs_"):
        raise HTTPException(
            status_code=400,
            detail={"message": f"Model '{model_name}' has no accessible architecture"}
        )

    layers = []
    # Iterate through model layers to extract weight information
    for i, weights in enumerate(model.coefs_):
        edges = []
        for j in range(weights.shape[1]):
            # Identify top-weighted input connections for each neuron
            sorted_indices = abs(weights[:, j]).argsort()[::-1][:top_k]
            for source_idx in sorted_indices:
                edges.append(
                    {
                        "src": int(source_idx),
                        "tgt": int(j),
                        "weight": float(weights[source_idx, j])
                    }
                )

        # Store layer-level information
        layers.append(
            {
                "layer_index": i,
                "input_dim": weights.shape[0],
                "output_dim": weights.shape[1],
                "edges": edges,
            }
        )

    # Return complete model architecture metadata
    return {
        "n_layers": model.n_layers_,
        "hidden_layer_sizes": model.hidden_layer_sizes,
        "out_activation": model.out_activation_,
        "layers": layers,
    }
