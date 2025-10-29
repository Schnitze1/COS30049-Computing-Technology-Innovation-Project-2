import pytest
from fastapi import HTTPException
from validators.input import validate_input_values


def test_validate_ok():
    vals = [[float(i) for i in range(15)]]
    validate_input_values(vals, allow_negative=True, expected_num_features=15)


def test_validate_wrong_len():
    with pytest.raises(HTTPException) as e:
        validate_input_values([[0, 1]], expected_num_features=15)
    assert e.value.status_code == 422


def test_validate_non_numeric():
    with pytest.raises(HTTPException) as e:
        validate_input_values([["x"] * 15], expected_num_features=15)
    assert e.value.status_code == 422


def test_validate_negative_disallowed():
    with pytest.raises(HTTPException) as e:
        validate_input_values([[-1] * 15], allow_negative=False, expected_num_features=15)
    assert e.value.status_code == 422
