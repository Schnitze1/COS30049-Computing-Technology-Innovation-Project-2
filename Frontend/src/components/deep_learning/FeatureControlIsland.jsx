import React from "react";
import { Box, Typography, Slider, useTheme } from "@mui/material";

const FeatureControlIsland = ({ feature, value, onChange, isDark }) => {
    const theme = useTheme();

    return (
        <Box
            sx={{
                p: 2,
                borderRadius: "12px",
                backgroundColor: theme.palette.mode === "dark" ? "#1A1414" : "#EFE9E0",
                color: theme.palette.mode === "dark" ? "#F0C966" : "#000",
                boxShadow:
                    theme.palette.mode === "dark"
                        ? "0 1px 8px rgba(240,201,102,0.15)"
                        : "0 1px 8px rgba(0,0,0,0.08)",
                transition: "all 0.3s ease",
                height: '100%', 
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
            }}
        >
            <Typography 
                gutterBottom 
                sx={{ 
                    color: isDark ? '#FFF' : '#000', 
                    fontWeight: '500', 
                    fontSize: '1rem',
                    mb: 1
                }}
            >
                {feature.name}
            </Typography>
            <Slider
                value={value}
                onChange={(e, newValue) => onChange(feature.index, newValue)}
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
                    lineHeight: 1.3
                }}
            >
                {feature.description}
            </Typography>
        </Box>
    );
};

export default FeatureControlIsland;