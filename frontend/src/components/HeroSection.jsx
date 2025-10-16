import React from "react";
import { Box, Typography, Button, Stack, useTheme } from "@mui/material";
// RouterLink not used


const HeroSection = () => {
    const theme = useTheme();
    const isDark = theme.palette.mode === "dark";
    const buttonStyles = {
        fontFamily: "Consolas, monospace",
        fontWeight: 500,
        fontSize: "16px",
        px: 4,
        py: 1.5,
        borderRadius: "8px",
        transition: "all 0.3s ease",
    };

    return (
        <Box
            sx={{
                position: "relative",
                height: "100vh",
                width: "100%",
                overflow: "hidden",
                backgroundColor: isDark ? "#1A1414" : "#FAFAFA",
                transition: "background-color 0.6s ease",
            }}
        >
            <video
                autoPlay
                loop
                muted
                playsInline
                poster="/auris-bg-poster.png"
                style={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    transform: "translate(-50%, -50%)",
                    zIndex: 0,
                    filter: isDark ? "brightness(55%) contrast(110%)" : "brightness(100%)",
                    transition: "filter 0.5s ease",
                }}
            >
                <source src="/auris-bg.mp4" type="video/mp4" />
                <img
                    src="/auris-bg-poster.png"
                    alt="Auris BG Poster"
                    style={{
                        position: "absolute",
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                    }}
                />
            </video>

            {isDark && (
                <Box
                    sx={{
                        position: "absolute",
                        inset: 0,
                        background: "rgba(0,0,0,0.5)",
                        zIndex: 1,
                        transition: "opacity 0.5s ease",
                    }}
                />
            )}

            <Box
                sx={{
                    position: "relative",
                    zIndex: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "flex-start",
                    height: "80%",
                    px: { xs: 3, md: 10 },
                    color: isDark ? "#F0C966" : "#000000",
                    transition: "color 0.5s ease",
                }}
            >
                <Box sx={{ maxWidth: 500 }}>
                    <Typography
                        variant="h2"
                        sx={{
                            fontFamily: "Consolas, monospace",
                            fontWeight: 700,
                            lineHeight: 1.1,
                            mb: 2,
                        }}
                    >
                        Auris AI
                    </Typography>

                    <Typography
                        variant="h4"
                        sx={{
                            fontFamily: "Consolas, monospace",
                            fontWeight: 500,
                            lineHeight: 1.2,
                            mb: 3,
                        }}
                    >
                        Unleash the Power of AI <br />
                        Network Traffic Monitoring
                    </Typography>

                    <Typography
                        variant="body1"
                        sx={{
                            fontFamily: "Consolas, monospace",
                            fontSize: "18px",
                            maxWidth: 450,
                            mb: 4,
                        }}
                    >
                        Detect unusual or potentially malicious network activity
                        distinguish normal behaviour from anomalies — powered by A.I
                    </Typography>
                    <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                        <Button
                            variant="contained"
                            href="/testing"
                            sx={{
                                ...buttonStyles,
                                backgroundColor: isDark ? "#F0C966" : "#000",
                                color: isDark ? "#000" : "#fff",
                                "&:hover": {
                                    backgroundColor: isDark ? "#e6b94e" : "#333",
                                },
                            }}
                        >
                            Get Started
                        </Button>
                        <Button
                            variant="outlined"
                            href="/about"
                            sx={{
                                ...buttonStyles,
                                color: isDark ? "#F0C966" : "#000",
                                borderColor: isDark ? "#F0C966" : "#000",
                                "&:hover": {
                                    backgroundColor: isDark
                                        ? "rgba(240, 201, 102, 0.1)"
                                        : "rgba(0, 0, 0, 0.04)",
                                    borderColor: isDark ? "#e6b94e" : "#333",
                                },
                            }}
                        >
                            Learn More
                        </Button>
                    </Stack>
                </Box>
            </Box>
        </Box>
    );
};

export default HeroSection;