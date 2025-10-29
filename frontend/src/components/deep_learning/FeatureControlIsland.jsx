/**
 * @file FeatureControlIsland.jsx
 * @description A self-contained UI component that provides a slider control
 * for a single machine learning feature
 */

import React from "react";
import PropTypes from "prop-types";
import { Box, Typography, Slider, useTheme } from "@mui/material";

/**
 * Renders the control island for a specific feature.
 * It includes the feature's name, a slider to adjust its value, and a
 * brief description
 *
 * @param {object} props The component props
 * @param {object} props.feature An object containing details about the feature
 * @param {number} props.value The current value of the feature slider
 * @param {Function} props.onChange The callback function to execute when the slider value changes
 * @param {boolean} props.isDark A boolean to toggle dark mode styles
 */
function FeatureControlIsland({
  feature, value, onChange, isDark,
}) {
  const theme = useTheme();

  return (
    <Box
      sx={{
        p: 2,
        borderRadius: "12px",
        backgroundColor: isDark ? "#1A1414" : "#EFE9E0",
        color: isDark ? "#F0C966" : "#000",
        boxShadow: isDark
          ? "0 1px 8px rgba(240,201,102,0.15)"
          : "0 1px 8px rgba(0,0,0,0.08)",
        transition: "all 0.3s ease",
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
    >
      <Typography
        gutterBottom
        sx={{
          color: isDark ? '#FFF' : '#000',
          fontWeight: '500',
          fontSize: '1rem',
          mb: 1,
        }}
      >
        {feature.name}
      </Typography>
      <Slider
        value={value}
        onChange={(event, newValue) => onChange(feature.index, newValue)}
        aria-labelledby="continuous-slider"
        min={0}
        max={1}
        step={0.01}
        valueLabelDisplay="auto"
        sx={{
          '& .MuiSlider-thumb': {
            color: theme.palette.primary.main,
          },
          '& .MuiSlider-track': {
            color: theme.palette.primary.light,
          },
          '& .MuiSlider-rail': {
            color: theme.palette.grey[400],
          },
        }}
      />
      <Typography
        variant="caption"
        sx={{
          fontSize: '0.65rem',
          color: isDark ? '#B0B0B0' : '#666',
          mt: 1,
          display: 'block',
          lineHeight: 1.3,
        }}
      >
        {feature.description}
      </Typography>
    </Box>
  );
}

FeatureControlIsland.propTypes = {
  feature: PropTypes.shape({
    name: PropTypes.string.isRequired,
    index: PropTypes.number.isRequired,
    description: PropTypes.string,
  }).isRequired,
  value: PropTypes.number.isRequired,
  onChange: PropTypes.func.isRequired,
  isDark: PropTypes.bool.isRequired,
};

export default FeatureControlIsland;