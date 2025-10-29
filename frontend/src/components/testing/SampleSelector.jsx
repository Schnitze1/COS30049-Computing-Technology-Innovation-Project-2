/**
 * @file SampleSelector.jsx
 * @description A component that provides a dropdown menu for selecting
 * predefined sample data presets
 */

import React from 'react';
import {
  FormControl, InputLabel, Select, MenuItem, Typography,
} from '@mui/material';
import { SAMPLES } from '../../constants/model_playground';

/**
 * Dropdown selector for loading preset traffic type data
 *
 * @param {object} props The component props
 * @param {string} props.value The currently selected sample name
 * @param {Function} props.onChange The callback function to execute when a sample is selected
 */
export default function SampleSelector({ value, onChange }) {
  const types = Object.keys(SAMPLES);

  return (
    <FormControl fullWidth>
      <InputLabel>Load Traffic Type Preset</InputLabel>
      <Select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        label="Load Traffic Type Preset"
      >
        {/* Map over the available traffic types to create a MenuItem for each */}
        {types.map((type) => (
          <MenuItem key={type} value={type}>
            <Typography>{type}</Typography>
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}