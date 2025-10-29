/**
 * @file DatasetMetrics.jsx
 * @description This file contains components for uploading a dataset, displaying
 * key metrics with animations, and showing a usability score based on a comparison
 * with a reference dataset.
 */

import React, { useState, useEffect } from "react";
import {
  Box, Button, Typography, Grid, CircularProgress, useTheme, // Added useTheme
} from "@mui/material";
import { compareDataset } from "../../api/predict";

/**
 * Renders a single statistic with a count-up animation.
 *
 * @param {object} props The component props.
 * @param {number} props.value The target value to animate to.
 * @param {string} props.label The label to display below the value.
 * @param {number} props.duration The desired duration of the animation in milliseconds.
 */
function AnimatedStat({ value, label, duration = 1500 }) { // Default duration 1.5s
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    setDisplayValue(0); // Reset when value changes
    if (value === 0) return undefined;

    let startValue = 0;
    const endValue = value;
    const animationStartTime = Date.now();

    const updateValue = () => {
      const now = Date.now();
      const elapsedTime = now - animationStartTime;
      const progress = Math.min(elapsedTime / duration, 1); // Ensure progress doesn't exceed 1

      // Use an easing function (e.g., easeOutQuad) for smoother animation
      const easedProgress = 1 - (1 - progress) * (1 - progress);
      startValue = Math.min(Math.round(easedProgress * endValue), endValue); // Ensure we don't exceed the target

      setDisplayValue(startValue);

      if (progress < 1) {
        requestAnimationFrame(updateValue); // Use requestAnimationFrame for smoother rendering
      }
    };

    const animationFrameId = requestAnimationFrame(updateValue);

    // Cleanup function to cancel the animation frame request
    return () => cancelAnimationFrame(animationFrameId);

  }, [value, duration]); // Rerun effect if value or duration changes

  return (
    <Box textAlign="center" sx={{ px: 2 }}>
      <Typography
        variant="h4"
        sx={{
          fontWeight: 600,
          background: "linear-gradient(45deg, #b06ab3, #4568dc)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        {displayValue.toLocaleString()}
      </Typography>
      <Typography variant="body1" sx={{ mt: 0.5, color: "text.primary" }}>
        {label}
      </Typography>
    </Box>
  );
}

// ... (UsabilityGauge component remains the same)
function UsabilityGauge({ usability }) {
  const percentage = Math.round(usability * 100);
  const gaugeColor = percentage > 80 ? "#4caf50" : percentage > 60 ? "#ffb300" : "#f44336";

  return (
    <Box textAlign="center" sx={{ mt: 4 }}>
      <Box sx={{ position: "relative", display: "inline-flex" }}>
        <CircularProgress
          variant="determinate"
          value={percentage}
          size={130}
          thickness={5}
          sx={{ color: gaugeColor }}
        />
        <Box
          sx={{
            position: "absolute", top: 0, left: 0, bottom: 0, right: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          <Typography variant="h6" color="text.primary">
            {`${percentage}%`}
          </Typography>
        </Box>
      </Box>
      <Typography variant="body2" sx={{ mt: 1, color: "text.secondary" }}>
        Dataset Usability Score
      </Typography>
    </Box>
  );
}


export default function DatasetMetrics() {
  const theme = useTheme(); // Added theme hook
  const isDark = theme.palette.mode === 'dark'; // Added isDark check

  const [fileName, setFileName] = useState("");
  const [numRecords, setNumRecords] = useState(0);
  const [numFeatures, setNumFeatures] = useState(0);
  const [featureOverlap, setFeatureOverlap] = useState(0);
  const [usability, setUsability] = useState(0);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setFileName(file.name);
    // Reset metrics before processing
    setNumRecords(0);
    setNumFeatures(0);
    setFeatureOverlap(0);
    setUsability(0);
    setLoading(true);
    setErrorMsg("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const result = await compareDataset(formData);
      // Update state after API call completes
      setNumRecords(result.records_uploaded);
      setNumFeatures(result.features_uploaded);
      setFeatureOverlap(result.matching_features);
      setUsability(result.similarity_score || 0);
    } catch (err) {
      console.error("Dataset comparison failed:", err);
      setErrorMsg("Failed to process dataset. Please check your file format.");
      // Reset metrics on error
      setNumRecords(0);
      setNumFeatures(0);
      setFeatureOverlap(0);
      setUsability(0);
      setFileName(""); // Clear filename on error too
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ textAlign: "center", py: 4, px: 2 }}>
      <Button
        variant="contained"
        component="label"
        // Updated the sx prop for consistent styling
        sx={{
          backgroundColor: isDark ? "#F0C966" : "#000",
          color: isDark ? "#000" : "#FFF",
          mb: 3,
          '&:hover': {
            backgroundColor: isDark ? '#e6b94e' : '#333',
          },
        }}
      >
        Upload CSV
        <input hidden accept=".csv" type="file" onChange={handleFileUpload} />
      </Button>

      {loading && (
        <Typography sx={{ mt: 2, color: "text.secondary" }}>
          Processing dataset...
        </Typography>
      )}
      {errorMsg && (
        <Typography sx={{ color: "error.main", mt: 2 }}>
          {errorMsg}
        </Typography>
      )}

      {fileName && !loading && !errorMsg && ( // Only show results if no error (DEBUGGING)
        <>
          <Typography variant="body2" sx={{ mb: 3, color: "text.secondary", fontStyle: "italic" }}>
            Uploaded file:
            {' '}
            <strong>{fileName}</strong>
          </Typography>
          <Grid container spacing={4} justifyContent="center">
            <Grid size={{ xs: 6, md: 3 }}>
              <AnimatedStat value={numFeatures} label="Features" />
            </Grid>
            <Grid size={{ xs: 6, md: 3 }}>
              {/* Animation for (5s) */}
              <AnimatedStat value={numRecords} label="Records" duration={5000} />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <AnimatedStat value={featureOverlap} label="Matching Features" />
            </Grid>
          </Grid>
          <UsabilityGauge usability={usability} />
          <Typography variant="body2" sx={{ mt: 3, color: "text.secondary", maxWidth: 500, mx: "auto" }}>
            {featureOverlap}
            {' '}
            of
            {' '}
            {numFeatures}
            {' '}
            features matched the
            {' '}
            <strong>TII-SSRC-23</strong>
            {' '}
            dataset.
          </Typography>
        </>
      )}
    </Box>
  );
}