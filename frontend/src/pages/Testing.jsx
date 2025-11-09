/**
 * @file Testing.jsx
 * @description Main testing page component for the Model Playground.
 * Provides an interface for selecting models, loading sample data, inputting feature values,
 * and viewing prediction results. Includes real-time validation and error handling.
 */

import React, { useState, useMemo, useEffect } from 'react';
import { useTheme } from '@mui/material/styles';
import {
  Box,
  Typography,
  Button,
  Alert,
  CircularProgress,
  Paper,
  Stack,
} from '@mui/material';
import { SAMPLES } from '../constants/model_playground';
import ModelSelector from '../components/testing/ModelSelector';
import SampleSelector from '../components/testing/SampleSelector';
import FeatureGrid from '../components/testing/FeatureGrid';
import PredictionPanel from '../components/testing/PredictionPanel';
import { predict } from '../api/predict';

/**
 * Reusable validation function for feature values.
 * Empty values will be auto-converted to 0, so they're allowed.
 * Zero (0) is allowed - empty/null/undefined will be converted to 0.
 * @param {Array<number|string>} values - Array of 15 feature values to validate
 * @returns {Object} Validation result with isValid boolean and error message
 * @returns {boolean} returns.isValid - Whether all values pass validation
 * @returns {string|null} returns.error - Error message if validation fails, null if valid
 */
const validateFeatures = (values) => {
  // Check for negative values (zero is allowed, empty will be converted to 0)
  const hasNegative = values.some(val => {
    // Skip empty values - they'll be converted to 0
    if (val === '' || val === null || val === undefined) {
      return false;
    }
    const numVal = Number(val);
    return !isNaN(numVal) && numVal < 0;
  });
  if (hasNegative) {
    return {
      isValid: false,
      error: 'All feature values must be non-negative',
    };
  }

  // Check for invalid numbers (excluding empty values which will be 0)
  const hasInvalid = values.some(val => {
    // Skip empty values - they'll be converted to 0
    if (val === '' || val === null || val === undefined) {
      return false;
    }
    const numVal = Number(val);
    return isNaN(numVal);
  });
  if (hasInvalid) {
    return {
      isValid: false,
      error: 'All feature values must be valid numbers',
    };
  }

  return {
    isValid: true,
    error: null,
  };
};

/**
 * Main Testing page component.
 * Manages model selection, sample data loading, feature input, and prediction display.
 * @returns {JSX.Element} The Testing page component
 */
const Testing = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  // Component state
  const [selectedModel, setSelectedModel] = useState('random_forest');
  const [selectedSample, setSelectedSample] = useState('Audio');
  const [predictions, setPredictions] = useState(null);
  const [values, setValues] = useState(SAMPLES['Audio']);
  const [loading, setLoading] = useState(false);
  const [validationError, setValidationError] = useState(null);
  const [apiError, setApiError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Validate features whenever values change using memoization for performance
  const validation = useMemo(() => validateFeatures(values), [values]);
  const isFormValid = validation.isValid;

  // Show validation error when form is invalid
  useEffect(() => {
    if (!isFormValid) {
      setValidationError(validation.error);
    } else {
      setValidationError(null);
    }
  }, [isFormValid, validation.error]);

  /**
   * Handles the prediction request to the backend API.
   * Validates inputs, converts empty values to 0, and displays results or errors.
   */
  const handlePredict = async () => {
    // Clear previous errors
    setValidationError(null);
    setApiError(null);
    setSuccess(null);

    // Validate before submitting (shouldn't happen if button is disabled, but double-check)
    if (!isFormValid) {
      setValidationError(validation.error);
      return;
    }

    // Convert empty/null/undefined values to 0, then convert all to numbers
    const numericValues = values.map(val => {
      if (val === '' || val === null || val === undefined) {
        return 0;
      }
      return Number(val);
    });

    setLoading(true);
    try {
      const response = await predict(selectedModel, numericValues);
      setPredictions(response);
      setSuccess('Prediction completed successfully!');
    } catch (err) {
      setApiError(`Prediction failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handles sample preset selection changes.
   * Updates both the selected sample and the feature values to match the preset.
   * @param {string} s - The name of the selected sample preset
   */
  const handleSampleChange = (s) => {
    setSelectedSample(s);
    setValues(SAMPLES[s]);
  };

  /**
   * Handles individual feature value changes.
   * Converts empty/null/undefined to 0 and ensures non-negative values.
   * Clears validation errors when user starts editing.
   * @param {number} index - Index of the feature being changed
   * @param {number|string} newVal - The new value for the feature
   */
  const handleValueChange = (index, newVal) => {
    setValues((prev) => {
      const next = [...prev];
      // Convert empty/null/undefined to 0, ensure non-negative values
      if (newVal === '' || newVal === null || newVal === undefined) {
        next[index] = 0;
      } else {
        const numVal = Number(newVal);
        next[index] = numVal < 0 ? 0 : numVal;
      }
      // Clear validation error when user starts editing
      if (validationError) {
        setValidationError(null);
      }
      return next;
    });
  };

  return (
    <Box
      sx={{
        p: 3,
        maxWidth: 1600,
        mx: 'auto',
        minHeight: '100vh',
        bgcolor: 'background.default',
      }}
    >
      <Typography
        variant="h4"
        gutterBottom
        sx={{
          mb: 4,
          textAlign: 'center',
          fontWeight: 'bold',
          color: isDark ? '#EF9B7D' : '#D95C39',
        }}
      >
        Model Playground
      </Typography>

      {/* Force side-by-side on desktop, stacked on mobile */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          gap: 4,
          alignItems: 'stretch',
          width: '100%',
        }}
      >
        {/* Left: Configuration */}
        <Paper
          sx={{
            flex: 1,
            p: 3,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
            Configuration
          </Typography>

          <Stack spacing={3} sx={{ flex: 1 }}>
            <ModelSelector value={selectedModel} onChange={setSelectedModel} />
            <SampleSelector value={selectedSample} onChange={handleSampleChange} />
            <FeatureGrid values={values} onChange={handleValueChange} />
            
            {/* Validation error display in Configuration section */}
            {validationError && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {validationError}
              </Alert>
            )}
          </Stack>

          <Button
            variant="contained"
            onClick={handlePredict}
            disabled={loading || !isFormValid}
            fullWidth
            size="large"
            sx={{
              mt: 3,
              py: 1.5,
              background: isFormValid
                ? 'linear-gradient(45deg,rgb(82, 17, 203), #2575fc)'
                : 'grey.400',
              color: '#fff',
              '&:hover': {
                background: isFormValid
                  ? 'linear-gradient(45deg, #5b0eb3, #1f63e0)'
                  : 'grey.500',
              },
              '&:disabled': {
                background: 'grey.400',
                color: 'grey.600',
              },
            }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Predict'}
          </Button>
        </Paper>

        {/* Right: Predicted Output */}
        <Paper
          sx={{
            flex: 1,
            p: 3,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
            Predicted Output
          </Typography>

          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            {/* Show API errors and success in Predicted Output */}
            {apiError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {apiError}
              </Alert>
            )}
            {success && (
              <Alert severity="success" sx={{ mb: 2 }}>
                {success}
              </Alert>
            )}

            {predictions ? (
              <PredictionPanel predictions={predictions} />
            ) : (
              <Box
                sx={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'text.secondary',
                  minHeight: '300px',
                }}
              >
                <Typography variant="body1">
                  Select a model and sample, then click Predict to see results
                </Typography>
              </Box>
            )}
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};

export default Testing;
