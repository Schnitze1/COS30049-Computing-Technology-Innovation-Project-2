import React from "react";
import { Box, Typography, Link, Grid, useTheme, Divider, IconButton } from "@mui/material";
import GitHubIcon from "@mui/icons-material/GitHub";

const Footer = () => {
    const theme = useTheme();
    const isDark = theme.palette.mode === "dark";

    const navLinks = [
        { label: "Home", href: "/" },
        { label: "About", href: "/about" },
        { label: "Testing", href: "/testing" },
    ];

    const modelLinks = [
        { label: "Supervised", href: "/testing/supervised" },
        { label: "Unsupervised", href: "/testing/unsupervised" },
        { label: "Deep Learning", href: "/testing/deep-learning" },
    ];

    const authors = [
        "105334128",
        "103814796",
        "Timothy Schnabel",
        "Kha Anh Nguyen",
    ];

    return (
        <Box
            component="footer"
            sx={{
                mt: 8,
                py: { xs: 6, md: 8 },
                px: { xs: 3, sm: 6, md: 8 },
                backgroundColor: isDark ? "#272121" : "#EFF0EB",
                color: isDark ? "#fff" : "#000",
                transition: "background-color 0.4s ease",
            }}
        >
            <Grid container spacing={4}>
                <Grid item xs={12} md={4}>
                    <Box sx={{ mb: 2 }}>
                        <img
                            src="/logo.svg"
                            alt="AurisAI Logo"
                            style={{
                                height: 36,
                                width: 36,
                                filter: isDark ? "invert(1)" : "none",
                                transition: "filter 0.4s ease",
                            }}
                        />
                    </Box>
                    <Typography variant="body2" sx={{ maxWidth: 220 }}>
                        AurisAI — building intelligent monitoring, responsibly.
                    </Typography>
                    <Box sx={{ mt: -13 }}>
                        <Link
                            href="https://github.com/Schnitze1/COS30049-Computing-Technology-Innovation-Project-2"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <IconButton
                                aria-label="GitHub Repository"
                                sx={{
                                    marginLeft: 5,
                                    color: isDark ? "#F0C966" : "#000",
                                    transition: "color 0.3s ease, transform 0.2s ease",
                                    "&:hover": {
                                        color: isDark ? "#e6b94e" : "#333",
                                        transform: "scale(1.1)",
                                    },
                                }}
                            >
                                <GitHubIcon fontSize="large" />
                            </IconButton>
                        </Link>
                    </Box>
                </Grid>

                <Grid item xs={6} md={2}>
                    <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600 }}>
                        Navigation
                    </Typography>
                    {navLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            underline="none"
                            sx={{
                                display: "block",
                                color: "inherit",
                                mb: 0.8,
                                "&:hover": {
                                    color: isDark ? "#F0C966" : "#333",
                                },
                                transition: "color 0.3s ease",
                            }}
                        >
                            {link.label}
                        </Link>
                    ))}
                </Grid>

                <Grid item xs={6} md={2}>
                    <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600 }}>
                        Models
                    </Typography>
                    {modelLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            underline="none"
                            sx={{
                                display: "block",
                                color: "inherit",
                                mb: 0.8,
                                "&:hover": {
                                    color: isDark ? "#F0C966" : "#333",
                                },
                                transition: "color 0.3s ease",
                            }}
                        >
                            {link.label}
                        </Link>
                    ))}
                </Grid>

                <Grid item xs={6} md={2}>
                    <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600 }}>
                        Authors
                    </Typography>
                    {authors.map((name, index) => (
                        <Typography key={index} variant="body2" sx={{ mb: 0.6 }}>
                            {name}
                        </Typography>
                    ))}
                </Grid>
            </Grid>
            <Divider
                sx={{
                    my: 4,
                    borderColor: isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.1)",
                }}
            />
        </Box>
    );
};

export default Footer;