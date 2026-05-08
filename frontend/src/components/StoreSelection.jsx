import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  Box, 
  Typography, 
  Grid, 
  Paper, 
  IconButton,
  Button,
  Avatar,
  alpha,
  useTheme,
  CircularProgress,
  Breadcrumbs,
  Link
} from '@mui/material';
import { 
  ArrowRight, 
  ShoppingCart, 
  Store, 
  X, 
  ChevronRight,
  ArrowLeft,
  ChevronLeft
} from 'lucide-react';
import axios from 'axios';

const StoreSelection = ({ open, onClose, onVendorSelect, itemCount }) => {
  const theme = useTheme();
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMainVendor, setSelectedMainVendor] = useState(null);

  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const response = await axios.get('http://localhost:3001/api/config/vendors');
        if (response.data.success) {
          setVendors(response.data.vendors);
        }
      } catch (error) {
        console.error("Failed to fetch vendors:", error);
      } finally {
        setLoading(false);
      }
    };

    if (open) {
      fetchVendors();
      setSelectedMainVendor(null); // Reset on open
    }
  }, [open]);

  const handleMainVendorClick = (vendor) => {
    if (vendor.subStores && vendor.subStores.length > 0) {
      setSelectedMainVendor(vendor);
    } else {
      onVendorSelect(vendor);
    }
  };

  const handleSubStoreClick = (subStore) => {
    // Combine vendor and sub-store data
    onVendorSelect({
      ...selectedMainVendor,
      subStoreId: subStore.id,
      name: `${selectedMainVendor.name} - ${subStore.name}`,
      logo: subStore.logo
    });
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 4, bgcolor: 'background.paper' }
      }}
    >
      <DialogTitle sx={{ p: 3, pb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <ShoppingCart color={theme.palette.primary.main} size={28} />
          <Box>
            <Typography variant="h6" fontWeight={800} sx={{ lineHeight: 1.2 }}>
              {selectedMainVendor ? `Select ${selectedMainVendor.name} Store` : "Choose Your Store"}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Transferring {itemCount} items to vendor cart
            </Typography>
          </Box>
        </Box>
        <IconButton onClick={onClose} size="small" sx={{ color: 'text.secondary' }}>
          <X size={20} />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3, pb: 4 }}>
        {selectedMainVendor && (
          <Button 
            startIcon={<ChevronLeft size={18} />}
            onClick={() => setSelectedMainVendor(null)}
            sx={{ mb: 2, color: 'text.secondary', textTransform: 'none' }}
          >
            Back to all stores
          </Button>
        )}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress size={30} />
          </Box>
        ) : (
          <Grid container spacing={2}>
            {!selectedMainVendor ? (
              // Main Vendors View (Phase 2)
              vendors.map((vendor) => (
                <Grid item xs={12} key={vendor.id}>
                  <Paper
                    elevation={0}
                    onClick={() => handleMainVendorClick(vendor)}
                    sx={{
                      p: 2.5,
                      borderRadius: 3,
                      border: '1.5px solid',
                      borderColor: 'divider',
                      cursor: 'pointer',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      '&:hover': {
                        borderColor: vendor.color || theme.palette.primary.main,
                        bgcolor: alpha(vendor.color || theme.palette.primary.main, 0.04),
                        transform: 'translateY(-4px)',
                        boxShadow: `0 8px 24px ${alpha(vendor.color || theme.palette.primary.main, 0.12)}`
                      }
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar 
                        src={vendor.logo} 
                        variant="rounded"
                        sx={{ 
                          width: 48, 
                          height: 48, 
                          bgcolor: alpha(vendor.color || theme.palette.primary.main, 0.1),
                          p: 0.5
                        }}
                      >
                        <Store size={24} />
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle1" fontWeight={700}>
                          {vendor.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {vendor.description}
                        </Typography>
                      </Box>
                    </Box>
                    <ChevronRight size={20} color={theme.palette.text.secondary} />
                  </Paper>
                </Grid>
              ))
            ) : (
              // Sub-Stores View (Phase 4 - Diagram Alignment Step 3)
              selectedMainVendor.subStores.map((sub) => (
                <Grid item xs={6} key={sub.id}>
                  <Paper
                    elevation={0}
                    onClick={() => handleSubStoreClick(sub)}
                    sx={{
                      p: 3,
                      borderRadius: 3,
                      border: '1.5px solid',
                      borderColor: 'divider',
                      cursor: 'pointer',
                      textAlign: 'center',
                      transition: 'all 0.25s ease',
                      '&:hover': {
                        borderColor: theme.palette.primary.main,
                        bgcolor: alpha(theme.palette.primary.main, 0.04),
                        transform: 'scale(1.02)'
                      }
                    }}
                  >
                    <img 
                      src={sub.logo} 
                      alt={sub.name} 
                      style={{ height: 40, objectFit: 'contain', marginBottom: 12 }} 
                    />
                    <Typography variant="subtitle2" fontWeight={700}>
                      {sub.name}
                    </Typography>
                  </Paper>
                </Grid>
              ))
            )}
          </Grid>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default StoreSelection;
