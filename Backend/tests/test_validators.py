import pytest
from fastapi import HTTPException
from validators.input import validate_input_values


def test_validate_ok():
    """
    Test that valid numeric input passes validation.

    :assert:
        No exception is raised for correctly formatted input.
    """
    values = [[float(i) for i in range(15)]]
    validate_input_values(values, allow_negative=True, expected_num_features=15)


def test_validate_wrong_len():
    """
    Test that input with incorrect feature length raises an error.

    :assert:
        HTTPException with status 422 is raised.
    """
    with pytest.raises(HTTPException) as exc_info:
        validate_input_values([[0, 1]], expected_num_features=15)
    assert exc_info.value.status_code == 422


def test_validate_non_numeric():
    """
    Test that non-numeric input raises an error.

    :assert:
        HTTPException with status 422 is raised.
    """
    with pytest.raises(HTTPException) as exc_info:
        validate_input_values([["x"] * 15], expected_num_features=15)
    assert exc_info.value.status_code == 422


def test_validate_negative_disallowed():
    """
    Test that negative input values raise an error when negatives are disallowed.

    :assert:
        HTTPException with status 422 is raised.
    """
    with pytest.raises(HTTPException) as exc_info:
        validate_input_values(
            [[-1] * 15],
            allow_negative=False,
            expected_num_features=15
        )
    assert exc_info.value.status_code == 422