import React from 'react';
import { Box, Typography, Link } from '@mui/material';

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        mt: 'auto',
        py: 3,
        textAlign: 'center',
        borderTop: '1px solid rgba(226, 232, 240, 0.8)',
        backgroundColor: 'transparent',
      }}
    >
      <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
        © {new Date().getFullYear()} 247OrderBay. Built by{' '}
        <Link
          href="https://github.com/AHMADHASSANRAFIQUE"
          target="_blank"
          rel="noopener noreferrer"
          sx={{
            color: 'primary.main',
            textDecoration: 'none',
            fontWeight: 700,
            '&:hover': { textDecoration: 'underline' }
          }}
        >
          Ahmad Hassan Rafique
        </Link>
        {' '}with Advanced AI Voice Intelligence.
      </Typography>
    </Box>
  );
};

export default Footer;