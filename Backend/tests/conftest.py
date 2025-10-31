import os
import sys
from pathlib import Path
import pytest
from fastapi.testclient import TestClient
from serve import app

# Ensure the model cache directory environment variable is set
os.environ.setdefault("MODEL_DIR", "cache/models")

# Make the repository root importable so `serve` resolves regardless of pytest run location
ROOT = Path(__file__).resolve().parent.parent
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))


@pytest.fixture(scope="session")
def client() -> TestClient:
    """
    Create a reusable FastAPI test client for the entire test session.

    :return:
        TestClient: FastAPI client instance used for API endpoint testing.
    """
    return TestClient(app)


@pytest.fixture()
def sample_vector_15() -> list[float]:
    """
    Provide a sample 15-dimensional feature vector for testing.

    :return:
        list[float]: A list of dummy numeric values within [0, 1] range.
    """
    # Reasonable dummy feature values for test purposes
    return [
        0.1, 0.2, 0.3, 0.4, 0.5,
        0.6, 0.7, 0.8, 0.9, 0.1,
        0.2, 0.3, 0.4, 0.5, 0.6
    ]