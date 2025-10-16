import React from "react";
import { Box, Typography, Divider, Link } from "@mui/material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { useTheme } from "@mui/material/styles";

const ContentIsland = () => {
    const theme = useTheme();
    const quickStartLinks = [
        { text: "Learn how to test Brute-Force Attacks", href: "/about" },
        { text: "How to upload your own data files", href: "/about" },
        { text: "How to view interactive visualisations", href: "/about" },
    ];

    return (
        <Box
            sx={{
                mt: { xs: 6, md: 10 },
                mx: { xs: 2, sm: 4, md: "auto" },
                maxWidth: "1100px",
                borderRadius: "16px",
                backgroundColor: theme.palette.mode === "dark" ? "#1A1414" : "#EFE9E0",
                color: theme.palette.mode === "dark" ? "#F0C966" : "#000",
                p: { xs: 3, sm: 5, md: 6 },
                display: "flex",
                flexDirection: { xs: "column", md: "row" },
                justifyContent: "space-between",
                alignItems: "stretch",
                gap: 4,
                boxShadow:
                    theme.palette.mode === "dark"
                        ? "0 2px 12px rgba(240,201,102,0.25)"
                        : "0 2px 12px rgba(0,0,0,0.1)",
                transition: "all 0.4s ease",
            }}
        >
            <Box sx={{ flex: 1 }}>
                <Typography
                    variant="h4"
                    sx={{
                        fontFamily: "Consolas, monospace",
                        fontWeight: 700,
                        fontSize: { xs: "1.6rem", sm: "2rem" },
                        mb: 1,
                    }}
                >
                    Model Integration Quick Start Guide
                </Typography>

                <Typography
                    variant="body1"
                    sx={{
                        maxWidth: 450,
                        fontSize: { xs: "0.95rem", sm: "1.05rem" },
                        color:
                            theme.palette.mode === "dark" ? "#d4c9a1" : "rgba(0,0,0,0.7)",
                        mb: 3,
                    }}
                >
                    Explore our guides for testing the functionality of our Supervised, Unsupervised and Deep Learning models. 
                    View interactive visualisations. Upload your own data to test our models.
                </Typography>
            </Box>

            <Box
                sx={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    gap: 2,
                    borderTop: { xs: "1px solid rgba(0,0,0,0.1)", md: "none" },
                    pt: { xs: 3, md: 0 },
                }}
            >
                {quickStartLinks.map((link, index) => (
                    <React.Fragment key={link.text}>
                        <Link href={link.href} underline="none" color="inherit">
                            <Box
                                sx={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    cursor: "pointer",
                                    py: 1,
                                    transition: "color 0.3s ease",
                                    "&:hover": {
                                        color:
                                            theme.palette.mode === "dark" ? "#fff" : "#333",
                                    },
                                    "& .arrow-icon": {
                                        transition: "transform 0.3s ease",
                                    },
                                    "&:hover .arrow-icon": {
                                        transform: "translateX(5px)",
                                    },
                                }}
                            >
                                <Typography
                                    variant="body1"
                                    sx={{
                                        fontFamily: "Consolas, monospace",
                                        fontWeight: 500,
                                        fontSize: "1rem",
                                    }}
                                >
                                    {link.text}
                                </Typography>
                                <ArrowForwardIcon className="arrow-icon" sx={{ fontSize: 22 }} />
                            </Box>
                        </Link>
                        {index < quickStartLinks.length - 1 && (
                            <Divider
                                sx={{
                                    borderColor:
                                        theme.palette.mode === "dark"
                                            ? "rgba(240,201,102,0.25)"
                                            : "rgba(0,0,0,0.1)",
                                }}
                            />
                        )}
                    </React.Fragment>
                ))}
            </Box>
        </Box>
    );
};

export default ContentIsland;