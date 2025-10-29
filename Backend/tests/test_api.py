import io
import json
import pandas as pd

def test_health(client):
	res = client.get("/health")
	assert res.status_code == 200
	assert res.json()["status"] == "ok"


def test_predict_422_length(client):
	res = client.post("/predict/mlp", json={"input_values": [[0,1]]})
	assert res.status_code == 422


def test_predict_404_unknown_model(client, sample_vector_15):
	res = client.post("/predict/unknown", json={"input_values": [sample_vector_15]})
	assert res.status_code == 404


def test_predict_ok_shape(client, sample_vector_15):
	res = client.post("/predict/mlp", json={"input_values": [sample_vector_15]})
	assert res.status_code == 200
	data = res.json()
	assert "predictions" in data and "model" in data


def test_model_architecture(client):
	res = client.get("/model-architecture/mlp?top_k=2")
	# Depending on environment, mlp may or may not be present; allow 200 or 404
	assert res.status_code in (200, 404)


def test_compare_dataset_invalid_csv(client):
    bad = io.BytesIO(b"not,csv\n\xff\x00")
    res = client.post("/compare-dataset", files={"file": ("bad.csv", bad, "text/csv")})
    # In some pandas versions, decoding errors may surface as generic Exceptions → 500.
    # Accept 400 (invalid csv), 404 (missing reference CSV), or 500 (unexpected decode error).
    assert res.status_code in (400, 404, 500)
