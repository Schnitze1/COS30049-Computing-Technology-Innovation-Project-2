/**
 * @file FeatureGrid.jsx
 * @description A component that renders a grid of input fields for all 15 feature values.
 * Provides real-time validation, prevents negative values, and auto-converts empty/null
 * values to 0 on blur. Displays validation errors inline for each field.
 */

import { useState } from 'react';
import { Grid, TextField, Typography, Box } from '@mui/material';
import { FEATURE_NAMES } from '../../constants/model_playground';

/**
 * Renders a grid of input fields for feature values with validation.
 * @param {Object} props - Component props
 * @param {Array<number|string>} props.values - Array of 15 feature values
 * @param {Function} props.onChange - Callback function when a value changes (index, newValue)
 * @returns {JSX.Element} Grid of TextField components for feature input
 */
export default function FeatureGrid({ values, onChange }) {
  const [errors, setErrors] = useState({});

  /**
   * Handles input field changes with validation.
   * Allows empty strings temporarily while typing, validates numbers, and prevents negatives.
   * @param {number} index - Index of the feature being edited
   * @param {string} value - The new input value as a string
   */
  const handleChange = (index, value) => {
    // Allow empty string temporarily while user is typing
    if (value === '') {
      onChange?.(index, '');
      setErrors(prev => ({ ...prev, [index]: null }));
      return;
    }

    // Convert to number
    const numValue = Number(value);

    // Check if value is negative
    if (!isNaN(numValue) && numValue < 0) {
      // Show error but don't update the value (let user see what they typed)
      setErrors(prev => ({ ...prev, [index]: 'Value must be non-negative' }));
      return;
    }

    // Clear error and update value for valid non-negative numbers
    if (!isNaN(numValue)) {
      setErrors(prev => ({ ...prev, [index]: null }));
      onChange?.(index, numValue);
    }
  };

  /**
   * Handles input field blur events.
   * Converts empty/null/undefined or negative values to 0 when the field loses focus.
   * @param {number} index - Index of the feature field
   * @param {string} value - The current input value
   */
  const handleBlur = (index, value) => {
    // On blur, convert empty or negative values to 0
    if (value === '' || value === null || value === undefined) {
      onChange?.(index, 0);
      setErrors(prev => ({ ...prev, [index]: null }));
      return;
    }
    
    const numValue = Number(value);
    if (!isNaN(numValue) && numValue < 0) {
      onChange?.(index, 0);
      setErrors(prev => ({ ...prev, [index]: null }));
    }
  };

  return (
    <Box sx={{ flex: 1, overflow: 'auto', maxHeight: { xs: '300px', md: 'none' } }}>
      <Typography variant="subtitle2" gutterBottom sx={{ mb: 2 }}>
        Input Features (Key-Value Pairs):
      </Typography>
      <Grid container spacing={2}>
        {FEATURE_NAMES.map((name, i) => {
          const hasError = errors[i] !== null && errors[i] !== undefined;
          // Display null/undefined as 0, but allow empty string temporarily while typing
          const displayValue = values?.[i] === null || values?.[i] === undefined 
            ? 0 
            : (values[i] === '' ? '' : values[i]);
          
          return (
            // Use responsive grid props: full width on mobile, half width on larger screens
            <Grid key={i} size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                size="small"
                label={name || `Feature ${i + 1}`}
                type="number"
                value={displayValue}
                onChange={(e) => handleChange(i, e.target.value)}
                onBlur={(e) => handleBlur(i, e.target.value)}
                inputProps={{
                  min: 0,
                  step: 'any',
                }}
                error={hasError}
                helperText={hasError ? errors[i] : ''}
              />
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
}