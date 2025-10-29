/**
 * @file AboutHero.jsx
 * @description A presentational component that serves as the hero section
 * for the About page, displaying a title and a paragraph
 */

import React from "react";
import { Box, Typography, useTheme } from "@mui/material";

/**
 * The hero section for the about page project description
 */
export default function AboutHero() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <Box sx={{ textAlign: "center", py: 10, px: 3 }}>
      <Typography
        variant="h3"
        sx={{
          fontFamily: "Consolas, monospace",
          mb: 2,
          color: isDark ? '#F0C966' : 'text.primary',
        }}
      >
        About AurisAI
      </Typography>
      <Typography
        variant="body1"
        sx={{
          textAlign: "justify",
          maxWidth: 600,
          mx: "auto",
          color: isDark ? 'grey.300' : 'text.secondary', 
        }}
      >
        Classify network traffic and detect unusual or potentially malicious activity.
        Students will analyse network data, extract features such as packet size and timing,
        and train models to distinguish normal behaviour from anomalies.
      </Typography>
    </Box>
  );
}