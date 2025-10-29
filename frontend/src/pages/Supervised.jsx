/**
 * @file supervised.jsx
 * @description Defines the main page for the supervised learning model demonstration.
 * This component acts as a container for the interactive supervised learning section.
 */

import React from "react";
import { Box } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import SupervisedHero from "../components/supervised/SupervisedHero";

/**
 * Renders the Supervised Learning page.
 * This component sets the page's background color and displays the main
 * interactive hero component for the supervised model.
 */
export default function Supervised() {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  return (
    <Box
      sx={{
        backgroundColor: isDark ? "#1A1414" : "#EAE6DE",
        minHeight: "100vh",
        transition: "background-color 0.4s ease",
        overflowX: 'hidden', // This line fixes the horizontal overflow on mobile
      }}
    >
      <SupervisedHero />
    </Box>
  );
}