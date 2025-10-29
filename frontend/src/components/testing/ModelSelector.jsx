/**
 * @file ModelSelector.jsx
 * @description A component that renders a dropdown menu for choosing
 * a machine learning model from a predefined list
 */

import React from 'react';
import {
  FormControl, InputLabel, Select, MenuItem, Box, Chip, Typography,
} from '@mui/material';
import { AVAILABLE_MODELS } from '../../constants/model_playground';

/**
 * Renders a dropdown selector for machine learning models.
 * Each item in the dropdown displays the model's name and a chip
 * indicating its type (e.g., supervised)
 *
 * @param {object} props The component props
 * @param {string} props.value The currently selected model name
 * @param {Function} props.onChange The callback function to execute when a model is selected
 */
export default function ModelSelector({ value, onChange }) {
  // A map to determine the color of the chip based on the model type for better UI feedback
  const chipColorMap = {
    supervised: 'primary',
    unsupervised: 'secondary',
    'deep learning': 'success',
  };

  return (
    <FormControl fullWidth>
      <InputLabel>Select model</InputLabel>
      <Select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        label="Select model"
      >
        {/* Map over the available models to create a MenuItem for each one */}
        {Object.entries(AVAILABLE_MODELS).map(([name, info]) => (
          <MenuItem key={name} value={name}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography>{name}</Typography>
              <Chip
                label={info.type}
                size="small"
                color={chipColorMap[info.type.toLowerCase()] || 'default'}
              />
            </Box>
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}