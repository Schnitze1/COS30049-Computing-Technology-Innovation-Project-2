/**
 * @file PredictionPanel.jsx
 * @description A component to display the results of a model prediction,
 * including the predicted class, confidence score, and a detailed breakdown.
 */

import React from 'react';
import {
  Box, Typography, Divider, Grid, Chip,
} from '@mui/material';
import { SAMPLES } from '../../constants/model_playground';
const TRAFFIC_TYPES = Object.keys(SAMPLES);

/**
 * Maps a prediction index to its corresponding class name
 * @param {number} index The prediction index from the model
 * @returns {string} 
 */
const getClassName = (index) => TRAFFIC_TYPES[index] || `Unknown (${index})`;

/**
 * Determines if a given traffic type is classified as benign
 * @param {string} name The name of the traffic type
 * @returns {boolean} True if the type is benign, otherwise false
 */
const isBenign = (name) => ['Audio', 'Background', 'Text', 'Video'].includes(name);

/**
 * Renders a panel displaying the output from a model prediction.
 * It shows the primary prediction, confidence, and a detailed list of
 * probabilities for all classes
 *
 * @param {object} props The component props
 * @param {object} props.predictions The prediction object returned from the API
 */
export default function PredictionPanel({ predictions }) {
  // If there are no predictions yet, show nothing
  if (!predictions) {
    return null;
  }
  const predictionIndex = predictions.predictions?.[0];
  const predictionName = getClassName(predictionIndex);
  const probabilities = predictions.probabilities?.[0] || [];
  const confidence = Number.isFinite(probabilities[predictionIndex])
    ? probabilities[predictionIndex] * 100
    : null;
  const label = isBenign(predictionName) ? 'Benign' : 'Malicious';

  return (
    <Box sx={{ flex: 1 }}>
      {/* Main Prediction Result */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Predicted:
          {' '}
          <span style={{ color: '#4caf50' }}>{predictionName}</span>
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <Chip
            label={`Type: ${label}`}
            color={label === 'Benign' ? 'success' : 'error'}
            variant="outlined"
          />
          {confidence !== null && (
            <Chip label={`Confidence: ${confidence.toFixed(1)}%`} variant="outlined" />
          )}
        </Box>
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* Detailed Prediction Breakdown */}
      <Grid container spacing={2}>
        {/* Column 1: List of all predictions (for multiple samples) */}
        <Grid size={{ xs: 6 }}>
          <Typography variant="subtitle2" gutterBottom>
            Predictions:
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {predictions.predictions.map((p, i) => (
              <Chip
                key={i}
                label={`Sample ${i + 1}: ${getClassName(p)} (${p})`}
                color="primary"
                variant="outlined"
              />
            ))}
          </Box>
        </Grid>

        {/* Column 2: List of all probabilities */}
        <Grid size={{ xs: 6 }}>
          <Typography variant="subtitle2" gutterBottom>
            Probabilities:
          </Typography>
          <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
            {predictions.probabilities?.map((probs, i) => (
              <Box key={i} sx={{ mb: 1 }}>
                <Typography variant="caption">
                  Sample
                  {' '}
                  {i + 1}
                  :
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                  {probs.map((prob, classIndex) => (
                    <Chip
                      key={classIndex}
                      label={`${getClassName(classIndex)}: ${prob.toFixed(3)}`}
                      size="small"
                      variant="outlined"
                      sx={{ alignSelf: 'flex-start' }}
                    />
                  ))}
                </Box>
              </Box>
            )) ?? (
            <Typography variant="body2" color="text.secondary">
              No probabilities available for this model
            </Typography>
            )}
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}