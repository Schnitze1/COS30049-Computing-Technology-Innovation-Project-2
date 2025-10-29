/**
 * @file TopBar.jsx
 * @description The main application navigation bar. It is responsive, featuring
 * a desktop view with dropdown menus and a full-screen mobile navigation overlay
 */

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
  Link,
} from "@mui/material";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import { Link as RouterLink } from "react-router-dom";

// A list of links for the mobile navigation menu
const MOBILE_NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Testing", href: "/testing" },
  { label: "Readme", href: "https://github.com/Schnitze1/COS30049-Computing-Technology-Innovation-Project-2/blob/main/README.md" },
];

/**
 * Renders the top navigation bar for the application.
 * Manages desktop and mobile navigation states, including hover-activated
 * dropdowns and scroll-based animations
 *
 * @param {object} props The component props
 * @param {boolean} props.darkMode Indicates if dark mode is active
 */
export default function TopBar({ darkMode }) {
  // State for managing which dropdown menu is open
  const [openMenu, setOpenMenu] = useState(null);
  // State for toggling the full-screen mobile menu
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  // State to track if the page has been scrolled down
  const [scrolled, setScrolled] = useState(false);

  // Refs to store the anchor element for each menu and the hover timer
  const anchorRef = useRef({});
  const hoverTimer = useRef(null);

  // Effect to handle the scroll animation for the logo and brand name
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Handlers for dropdown menus to create a hover-intent effect
  const handleOpen = (event, menuName) => {
    clearTimeout(hoverTimer.current);
    setOpenMenu(menuName);
    anchorRef.current[menuName] = event.currentTarget;
  };

  const handleClose = () => {
    // A short delay before closing allows the user to move their mouse
    // from the button to the menu without it closing
    hoverTimer.current = setTimeout(() => setOpenMenu(null), 120);
  };

  const immediateClose = () => {
    clearTimeout(hoverTimer.current);
    setOpenMenu(null);
  };

  // Toggles the visibility of the mobile navigation overlay
  const handleMobileToggle = () => {
    setMobileMenuOpen((prev) => !prev);
  };

  // Base styles for desktop navigation buttons
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
    "&:hover": { color: darkMode ? "#F0C966" : "#333" },
    "&:hover::after": { width: "100%" },
  };

  // styles for dropdown buttons to show an active state
  const dropdownButtonStyle = (isOpen) => ({
    ...navButtonBase,
    "&::after": {
      ...navButtonBase["&::after"],
      width: isOpen ? "100%" : 0,
    },
  });

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
        <Toolbar sx={{ display: "flex", justifyContent: "space-between", px: { xs: 3, md: 8 } }}>
          {/* Logo and Company Name */}
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

          {/* Desktop Navigation */}
          <Box sx={{ display: { xs: "none", md: "flex" }, alignItems: "center" }}>
            <Button href="/" sx={navButtonBase}>Home</Button>
            <Box onMouseEnter={(e) => handleOpen(e, "learn")} onMouseLeave={handleClose}>
              <Button sx={dropdownButtonStyle(openMenu === "learn")} endIcon={<ArrowDropDownIcon />}>
                Learn
              </Button>
              <Menu
                anchorEl={anchorRef.current.learn}
                open={openMenu === "learn"}
                onClose={immediateClose}
                MenuListProps={{ onMouseEnter: () => clearTimeout(hoverTimer.current), onMouseLeave: handleClose }}
              >
                <MenuItem component={RouterLink} to="/about" onClick={immediateClose}>About</MenuItem>
                <Divider sx={{ my: 1 }} />
                <MenuItem component="a" href="https://github.com/Schnitze1/COS30049-Computing-Technology-Innovation-Project-2/blob/main/README.md" target="_blank" onClick={immediateClose}>
                  Readme.md
                </MenuItem>
              </Menu>
            </Box>
            <Box onMouseEnter={(e) => handleOpen(e, "models")} onMouseLeave={handleClose}>
              <Button sx={dropdownButtonStyle(openMenu === "models")} endIcon={<ArrowDropDownIcon />}>
                Models
              </Button>
              <Menu
                anchorEl={anchorRef.current.models}
                open={openMenu === "models"}
                onClose={immediateClose}
                MenuListProps={{ onMouseEnter: () => clearTimeout(hoverTimer.current), onMouseLeave: handleClose }}
              >
                <MenuItem component={RouterLink} to="/testing/supervised" onClick={immediateClose}>Supervised</MenuItem>
                <MenuItem component={RouterLink} to="/testing/unsupervised" onClick={immediateClose}>Unsupervised</MenuItem>
                <MenuItem component={RouterLink} to="/testing/deep-learning" onClick={immediateClose}>Deep Learning</MenuItem>
              </Menu>
            </Box>
            <Button
              href="/testing"
              sx={{
                backgroundColor: darkMode ? "#F0C966" : "#000",
                color: darkMode ? "#000" : "#fff",
                "&:hover": { backgroundColor: darkMode ? "#e6b94e" : "#222" },
              }}
            >
              Try Models
            </Button>
          </Box>

          {/* Mobile Navigation Toggle */}
          <Box sx={{ display: { xs: "flex", md: "none" } }}>
            <IconButton onClick={handleMobileToggle} sx={{ color: darkMode ? "#F0C966" : "#000" }}>
              {mobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Mobile Navigation Panel */}
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
        }}
      >
        {MOBILE_NAV_LINKS.map((link, i) => (
          <Link
            key={link.label}
            href={link.href}
            target={link.href.startsWith('http') ? '_blank' : '_self'}
            rel={link.href.startsWith('http') ? 'noopener noreferrer' : ''}
            underline="none"
            sx={{
              opacity: mobileMenuOpen ? 1 : 0,
              transform: mobileMenuOpen ? "translateY(0)" : "translateY(20px)",
              transition: `opacity 0.6s ease ${i * 0.1}s, transform 0.6s ease ${i * 0.1}s`,
            }}
          >
            <Typography variant="h4" sx={{ color: darkMode ? "#F0C966" : "#000" }}>
              {link.label}
            </Typography>
          </Link>
        ))}
      </Box>
    </>
  );
}