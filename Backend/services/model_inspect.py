from config import get_model_dir
from fastapi import HTTPException
from utils.model_io import list_models, load_model


def model_architecture_service(model_name: str, top_k: int = 5) -> dict:
    """Get the architecture of a neural network model."""
    models = list_models(out_dir=get_model_dir())

    if model_name not in models:
        raise HTTPException(status_code=404, detail={"message": f"Model '{model_name}' not found"})

    model = load_model(model_name, out_dir=get_model_dir())

    if not hasattr(model, "coefs_"):
        raise HTTPException(
            status_code=400,
            detail={"message": f"Model '{model_name}' has no accessible architecture"},
        )

    layers = []
    for i, weights in enumerate(model.coefs_):
        edges = []
        for j in range(weights.shape[1]):
            sorted_i = abs(weights[:, j]).argsort()[::-1][:top_k]
            for source_i in sorted_i:
                edges.append(
                    {"src": int(source_i), "tgt": int(j), "weight": float(weights[source_i, j])}
                )
        layers.append(
            {
                "layer_index": i,
                "input_dim": weights.shape[0],
                "output_dim": weights.shape[1],
                "edges": edges,
            }
        )

    return {
        "n_layers": model.n_layers_,
        "hidden_layer_sizes": model.hidden_layer_sizes,
        "out_activation": model.out_activation_,
        "layers": layers,
    }
