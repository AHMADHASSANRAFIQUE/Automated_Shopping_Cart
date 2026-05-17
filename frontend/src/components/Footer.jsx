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
        © {new Date().getFullYear()} 247OrderBay. Powered by Advanced AI Voice Intelligence & Automated E-Commerce.
      </Typography>
    </Box>
  );
};

export default Footer;