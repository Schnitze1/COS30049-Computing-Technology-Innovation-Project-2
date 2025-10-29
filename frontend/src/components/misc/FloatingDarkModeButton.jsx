/**
 * @file FloatingDarkModeButton.jsx
 * @description A floating action button component that allows the user to
 * toggle between light and dark color modes for the application.
 */

import React from "react";
import { IconButton, useTheme } from "@mui/material";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";

/**
 * Renders a floating button with an icon that toggles the dark mode
 * The button is fixed to the bottom left of the screen and displays a sun
 * or moon icon depending on the current theme
 *
 * @param {object} props The component props
 * @param {Function} props.toggleDarkMode Call when the button is clicked
 */
export default function FloatingDarkModeButton({ toggleDarkMode }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  return (
    <IconButton
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      onClick={toggleDarkMode}
      size="large"
      sx={{
        position: "fixed",
        bottom: 100,
        left: 40,
        zIndex: 1400, // Ensure it's above most other content
        backgroundColor: isDark ? "#272121" : "#EFF0EB",
        color: isDark ? "#F0C966" : "#000000",
        border: isDark ? "1px solid #F0C966" : "1px solid #000000",
        transition: "transform 200ms ease, background-color 300ms ease, box-shadow 300ms ease",
        // Apply a pulsing animation only in dark mode
        ...(isDark && {
          animation: "pulseGold 2s infinite ease-in-out",
        }),
        "&:hover": {
          transform: "scale(1.08)",
          backgroundColor: isDark ? "#1A1414" : "#dcdcdc",
        },
        // Define the keyframes for the pulsing animation
        "@keyframes pulseGold": {
          "0%": { boxShadow: "0 0 0 0 rgba(240,201,102,0.35)" },
          "50%": { boxShadow: "0 0 18px 6px rgba(240,201,102,0.15)" },
          "100%": { boxShadow: "0 0 0 0 rgba(240,201,102,0)" },
        },
      }}
    >
      {isDark ? <Brightness7Icon /> : <Brightness4Icon />}
    </IconButton>
  );
}