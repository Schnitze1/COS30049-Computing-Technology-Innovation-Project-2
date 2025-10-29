/**
 * @file unsupervised.jsx
 * @description Defines the main page for the unsupervised learning model demonstration.
 * This component serves as a container for the interactive unsupervised learning section.
 */

import React from "react";
import { Box } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import UnsupervisedHero from "../components/unsupervised/UnsupervisedHero";

/**
 * Renders the Unsupervised Learning page.
 * This component sets the page's background color based on the current theme
 * and displays the main interactive hero component for the unsupervised model.
 */
export default function UnsupervisedPage() {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  return (
    <Box
      sx={{
        backgroundColor: isDark ? "#1A1414" : "#EAE6DE",
        minHeight: "100vh",
        transition: "background-color 0.4s ease",
      }}
    >
      <UnsupervisedHero />
    </Box>
  );
}