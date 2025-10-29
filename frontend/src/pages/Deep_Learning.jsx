/**
 * @file deep_learning.jsx
 * @description This file defines the main "Deep Learning" page, which assembles
 * various components to demonstrate the MLP model's architecture and predictions.
 */

import React from "react";
import { useTheme, Box, Typography } from "@mui/material";
import DeepHero from "../components/deep_learning/DeepHero";
import DeepLearningDiagram from "../components/deep_learning/DeepLearningDiagram";
import ScrollProgressBar from "../components/misc/ScrollProgressBar";

/**
 * Renders the Deep Learning demonstration page.
 * This page features an interactive diagram of the MLP model's neural pathways
 * and a hero section for real-time prediction testing.
 */
export default function DeepLearningPage() {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  return (
    <Box sx={{
      backgroundColor: isDark ? "#1A1414" : "#EAE6DE",
      transition: "background-color 0.5s ease",
      py: 4,
      overflowX: 'hidden',
    }}
    >
      {/* Section 1: MLP Model Architecture Diagram */}
      <Box sx={{ px: 4, textAlign: 'center' }}>
        <Box sx={{ pt: 2, position: 'relative', zIndex: 1 }}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 'bold',
              color: isDark ? '#EF9B7D' : '#D95C39',
            }}
          >
            MLP Model Architecture
          </Typography>
          <Typography
            variant="subtitle1"
            sx={{
              color: isDark ? 'grey.400' : 'grey.700',
              mt: 0.5,
              fontSize: '1rem',
            }}
          >
            An interactive visualisation of the MLP neural pathways for each network type classification.
          </Typography>
        </Box>
        {/* The negative margin pulls the diagram up slightly to overlap with the title area. */}
        <Box sx={{ marginTop: { xs: 2, sm: '-85px' } }}> {/* Make margin responsive */}
          <DeepLearningDiagram modelName="mlp" isDark={isDark} />
        </Box>
      </Box>

      {/* Separator with a scroll progress bar */}
      <Box sx={{ my: 10 }}>
        <ScrollProgressBar />
      </Box>

      {/* Section 2: Interactive Prediction Hero */}
      <DeepHero />
    </Box>
  );
}