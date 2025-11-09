/**
 * @file NotFound.jsx
 * @description 404 Not Found page component for handling invalid routes.
 */

import React from 'react';
import { Box, Typography, Button, Container } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';

/**
 * Renders a 404 Not Found page when user navigates to an invalid route.
 * @returns {JSX.Element} The 404 Not Found page component
 */
export default function NotFound() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const navigate = useNavigate();

  return (
    <Container maxWidth="md">
      <Box
        sx={{
          minHeight: '60vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          py: 8,
        }}
      >
        <Typography
          variant="h1"
          sx={{
            fontSize: { xs: '4rem', md: '6rem' },
            fontWeight: 'bold',
            color: isDark ? '#F0C966' : '#D95C39',
            mb: 2,
          }}
        >
          404
        </Typography>
        <Typography
          variant="h4"
          sx={{
            mb: 2,
            color: isDark ? '#EF9B7D' : '#000',
            fontFamily: 'Consolas, monospace',
          }}
        >
          Page Not Found
        </Typography>
        <Typography
          variant="body1"
          sx={{
            mb: 4,
            color: isDark ? 'grey.400' : 'grey.700',
            maxWidth: 500,
          }}
        >
          The page you're looking for doesn't exist or has been moved.
          Please check the URL or navigate back to the homepage.
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
          <Button
            component={Link}
            to="/"
            variant="contained"
            sx={{
              backgroundColor: isDark ? '#F0C966' : '#000',
              color: isDark ? '#000' : '#fff',
              '&:hover': {
                backgroundColor: isDark ? '#e6b94e' : '#333',
              },
            }}
          >
            Go to Home
          </Button>
          <Button
            variant="outlined"
            onClick={() => navigate(-1)}
            sx={{
              borderColor: isDark ? '#F0C966' : '#000',
              color: isDark ? '#F0C966' : '#000',
              '&:hover': {
                borderColor: isDark ? '#e6b94e' : '#333',
                backgroundColor: isDark ? 'rgba(240, 201, 102, 0.1)' : 'rgba(0, 0, 0, 0.04)',
              },
            }}
          >
            Go Back
          </Button>
        </Box>
      </Box>
    </Container>
  );
}

