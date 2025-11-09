import io
import json
import pandas as pd


def test_health(client):
    """
    Test the health check endpoint.

    :param client:
        FastAPI test client fixture.
    :assert:
        - Status code is 200.
        - Response JSON contains {"status": "ok"}.
    """
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_predict_422_length(client):
    """
    Test that prediction fails with input of incorrect feature length.

    :param client:
        FastAPI test client fixture.
    :assert:
        - Status code is 422 for validation error.
    """
    response = client.post("/predict/mlp", json={"input_values": [[0, 1]]})
    assert response.status_code == 422


def test_predict_404_unknown_model(client, sample_vector_15):
    """
    Test that requesting an unknown model returns a 404 error.

    :param client:
        FastAPI test client fixture.
    :param sample_vector_15:
        Sample 15-dimensional input vector.
    :assert:
        - Status code is 404 for missing model.
    """
    response = client.post("/predict/unknown", json={"input_values": [sample_vector_15]})
    assert response.status_code == 404


def test_predict_ok_shape(client, sample_vector_15):
    """
    Test successful prediction and response structure.

    :param client:
        FastAPI test client fixture.
    :param sample_vector_15:
        Sample 15-dimensional input vector.
    :assert:
        - Status code is 200.
        - Response contains "predictions" and "model" keys.
    """
    response = client.post("/predict/mlp", json={"input_values": [sample_vector_15]})
    assert response.status_code == 200
    data = response.json()
    assert "predictions" in data and "model" in data


def test_model_architecture(client):
    """
    Test the model architecture endpoint.

    :param client:
        FastAPI test client fixture.
    :assert:
        - Status code is either 200 or 404 depending on environment.
    """
    response = client.get("/model-architecture/mlp?top_k=2")
    # Depending on environment, model may or may not exist
    assert response.status_code in (200, 404)


def test_compare_dataset_invalid_csv(client):
    """
    Test handling of invalid CSV input in dataset comparison.

    :param client:
        FastAPI test client fixture.
    :assert:
        - Acceptable status codes: 400 (invalid CSV),
          404 (missing reference), or 500 (decode error).
    """
    bad_csv = io.BytesIO(b"not,csv\n\xff\x00")
    response = client.post(
        "/compare-dataset",
        files={"file": ("bad.csv", bad_csv, "text/csv")}
    )
    assert response.status_code in (400, 404, 500)
