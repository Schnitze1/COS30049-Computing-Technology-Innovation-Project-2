import React, { useState, useEffect, useRef } from "react";
import {
    AppBar,
    Toolbar,
    Typography,
    Box,
    Button,
    IconButton,
    Menu,
    MenuItem,
    Divider,
    Link, // Import Link Add Later
} from "@mui/material";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import { Link as RouterLink } from "react-router-dom";

const TopBar = ({ darkMode }) => {
    const [openMenu, setOpenMenu] = useState(null);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const anchorRef = useRef({});
    const hoverTimer = useRef(null);

    // Scroll animation for logo
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const handleOpen = (event, menuName) => {
        clearTimeout(hoverTimer.current);
        setOpenMenu(menuName);
        anchorRef.current[menuName] = event.currentTarget;
    };

    const handleClose = () => {
        hoverTimer.current = setTimeout(() => setOpenMenu(null), 120);
    };

    const immediateClose = () => {
        clearTimeout(hoverTimer.current);
        setOpenMenu(null);
    };

    const handleMobileToggle = () => {
        setMobileMenuOpen((prev) => !prev);
    };

    const navButtonBase = {
        fontFamily: "Consolas, monospace",
        fontSize: "17px",
        fontWeight: 400,
        textTransform: "none",
        letterSpacing: "0.5px",
        color: darkMode ? "#fff" : "#000",
        margin: "0 28px",
        px: "12px",
        py: "8px",
        position: "relative",
        backgroundColor: "transparent",
        transition: "color 0.3s ease",
        "&::after": {
            content: '""',
            position: "absolute",
            bottom: 0,
            left: 0,
            width: 0,
            height: "2px",
            backgroundColor: darkMode ? "#F0C966" : "#000",
            transition: "width 0.3s ease",
        },
        "&:hover": {
            color: darkMode ? "#F0C966" : "#333",
        },
        "&:hover::after": {
            width: "100%",
        },
    };

    const dropdownButtonStyle = (isOpen) => ({
        ...navButtonBase,
        "&::after": {
            ...navButtonBase["&::after"],
            width: isOpen ? "100%" : 0,
        },
        "&:hover::after": {
            width: "100%",
        },
    });

    const commonMenuProps = (menuName) => ({
        PaperProps: {
            sx: {
                borderRadius: 2,
                padding: 1,
                minWidth: 180,
                mt: 1,
                backgroundColor: darkMode ? "#272121" : "#fff",
                color: darkMode ? "#fff" : "#000",
            },
        },
        anchorEl: anchorRef.current[menuName],
        open: openMenu === menuName,
        onClose: immediateClose,
        MenuListProps: {
            onMouseEnter: () => clearTimeout(hoverTimer.current),
            onMouseLeave: handleClose,
        },
        disableScrollLock: true,
    });

    const mobileNavLinks = [
        { label: "Home", href: "/" },
        { label: "About", href: "/about" },
        { label: "Testing", href: "/testing" },
        { label: "Readme", href: "https://github.com/Schnitze1/COS30049-Computing-Technology-Innovation-Project-2/blob/main/README.md" }
    ];

    return (
        <>
            <AppBar
                position="fixed"
                sx={{
                    backgroundColor: darkMode ? "#272121" : "#EFF0EB",
                    transition: "all 0.4s ease",
                    boxShadow: "none",
                    zIndex: 1201,
                    height: "80px",
                    justifyContent: "center",
                }}
            >
                <Toolbar
                    sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        px: { xs: 3, md: 8 },
                    }}
                >
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                        <Link href="/" sx={{ display: 'flex', alignItems: 'center' }}>
                            <img
                                src="/logo.svg"
                                alt="AurisAI Logo"
                                style={{
                                    height: 38,
                                    width: 38,
                                    marginRight: 12,
                                    transition: "transform 0.3s ease, filter 0.4s ease",
                                    transform: scrolled ? "scale(0.9)" : "scale(1)",
                                    filter: darkMode ? "invert(1)" : "invert(0)",
                                }}
                            />
                        </Link>
                        <Typography
                            variant="h6"
                            sx={{
                                fontFamily: "Consolas, monospace",
                                fontWeight: 600,
                                fontSize: "22px",
                                opacity: scrolled ? 0 : 1,
                                transform: scrolled ? "translateX(-25px)" : "translateX(0)",
                                transition: "all 0.5s ease",
                                color: darkMode ? "#F0C966" : "#000",
                            }}
                        >
                            AurisAI
                        </Typography>
                    </Box>

                    <Box
                        sx={{
                            display: { xs: "none", md: "flex" },
                            alignItems: "center",
                        }}
                    >
                        <Button href="/" sx={navButtonBase}>Home</Button>

                        <Box
                            onMouseEnter={(e) => handleOpen(e, "learn")}
                            onMouseLeave={handleClose}
                        >
                            <Button
                                ref={(el) => (anchorRef.current.learn = el)}
                                onClick={(e) => handleOpen(e, "learn")}
                                sx={dropdownButtonStyle(openMenu === "learn")}
                                endIcon={
                                    <ArrowDropDownIcon
                                        sx={{
                                            transition: "transform 0.3s ease",
                                            transform:
                                                openMenu === "learn"
                                                    ? "rotate(180deg)"
                                                    : "rotate(0deg)",
                                        }}
                                    />
                                }
                            >
                                Learn
                            </Button>
                            <Menu {...commonMenuProps("learn")}>
                                <MenuItem component={RouterLink} to="/about" onClick={immediateClose}>About</MenuItem>
                                <Divider sx={{ my: 1 }} />
                                <MenuItem component="a" href="https://github.com/Schnitze1/COS30049-Computing-Technology-Innovation-Project-2/blob/main/README.md" target="_blank" rel="noopener noreferrer" onClick={immediateClose}>
                                    Readme.md
                                </MenuItem>
                            </Menu>
                        </Box>
                        <Box
                            onMouseEnter={(e) => handleOpen(e, "models")}
                            onMouseLeave={handleClose}
                        >
                            <Button
                                ref={(el) => (anchorRef.current.models = el)}
                                onClick={(e) => handleOpen(e, "models")}
                                sx={dropdownButtonStyle(openMenu === "models")}
                                endIcon={<ArrowDropDownIcon sx={{ transition: "transform 0.3s ease", transform: openMenu === "models" ? "rotate(180deg)" : "rotate(0deg)" }} />}
                            >
                                Models
                            </Button>
                            <Menu {...commonMenuProps("models")}>
                                <MenuItem component="a" href="/testing/supervised" onClick={immediateClose}>Supervised</MenuItem>
                                <MenuItem component="a" href="/testing/unsupervised" onClick={immediateClose}>Unsupervised</MenuItem>
                                <MenuItem component="a" href="/testing/deep-learning" onClick={immediateClose}>Deep Learning</MenuItem>
                            </Menu>
                        </Box>

                        <Button
                            href="/testing"
                            sx={{
                                backgroundColor: darkMode ? "#F0C966" : "#000",
                                color: darkMode ? "#000" : "#fff",
                                borderRadius: "10px",
                                fontFamily: "Consolas, monospace",
                                fontSize: "16px",
                                fontWeight: 400,
                                padding: "10px 22px",
                                marginLeft: 3,
                                letterSpacing: "0.3px",
                                "&:hover": {
                                    backgroundColor: darkMode ? "#e6b94e" : "#222",
                                },
                            }}
                        >
                            Try Models
                        </Button>
                    </Box>

                    <Box sx={{ display: { xs: "flex", md: "none" } }}>
                        <IconButton
                            onClick={handleMobileToggle}
                            sx={{
                                color: darkMode ? "#F0C966" : "#000",
                                transition: "transform 0.4s ease",
                                transform: mobileMenuOpen ? "rotate(90deg)" : "rotate(0deg)",
                            }}
                        >
                            {mobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
                        </IconButton>
                    </Box>
                </Toolbar>
            </AppBar>

            <Box
                sx={{
                    position: "fixed",
                    top: mobileMenuOpen ? "80px" : "-100vh",
                    left: 0,
                    width: "100%",
                    height: "calc(100vh - 80px)",
                    backgroundColor: darkMode ? "#1A1414" : "#EFF0EB",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "top 0.5s ease",
                    zIndex: 1200,
                    overflow: "hidden",
                }}
            >
                {mobileNavLinks.map(({ label, href }, i) => (
                    <Link
                        key={label}
                        href={href}
                        target={href.startsWith('http') ? '_blank' : '_self'}
                        rel={href.startsWith('http') ? 'noopener noreferrer' : ''}
                        underline="none"
                        sx={{
                            color: "inherit",
                            mb: 3,
                            opacity: mobileMenuOpen ? 1 : 0,
                            transform: mobileMenuOpen
                                ? "translateY(0)"
                                : "translateY(20px)",
                            transition: `opacity 0.6s ease ${i * 0.1}s, transform 0.6s ease ${i * 0.1}s`,
                        }}
                    >
                        <Typography
                            variant="h4"
                            sx={{
                                fontFamily: "Consolas, monospace",
                                fontWeight: 600,
                                position: "relative",
                                cursor: "pointer",
                                color: darkMode ? "#F0C966" : "#000",
                                "&::after": {
                                    content: '""',
                                    position: "absolute",
                                    bottom: -5,
                                    left: 0,
                                    width: 0,
                                    height: "3px",
                                    backgroundColor: darkMode ? "#F0C966" : "#000",
                                    transition: "width 0.3s ease",
                                },
                                "&:hover::after": {
                                    width: "100%",
                                },
                            }}
                        >
                            {label}
                        </Typography>
                    </Link>
                ))}
            </Box>
        </>
    );
};

export default TopBar;