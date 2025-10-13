// src/components/FloatingDarkModeButton.jsx
import React from "react";
import { IconButton, useTheme } from "@mui/material";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";

const FloatingDarkModeButton = ({ toggleDarkMode }) => {
    const theme = useTheme();
    const isDark = theme.palette?.mode === "dark";

    return (
        <IconButton
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            onClick={toggleDarkMode}
            size="large"
            sx={{
                position: "fixed",
                bottom: 100,
                left: 40,
                zIndex: 1400, // HIGHER than AppBar / hero overlays
                backgroundColor: isDark ? "#272121" : "#EFF0EB",
                color: isDark ? "#F0C966" : "#000000",
                border: isDark ? "1px solid #F0C966" : "1px solid #000000",
                transition: "transform 200ms ease, background-color 300ms ease, color 300ms ease, box-shadow 300ms ease",
                // define keyframes inline so MUI doesn't need external import
                ...(isDark && {
                    // pulse using box-shadow
                    animation: "pulseGold 2s infinite ease-in-out",
                }),
                "&:hover": {
                    transform: "scale(1.08)",
                    backgroundColor: isDark ? "#1A1414" : "#dcdcdc",
                },
                // Ensure pointer events and visibility
                pointerEvents: "auto",
                // Inline keyframes (MUI sx supports this)
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
};

export default FloatingDarkModeButton;