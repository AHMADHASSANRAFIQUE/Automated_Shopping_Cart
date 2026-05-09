import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  Box, 
  Typography, 
  Button, 
  CircularProgress,
  alpha,
  useTheme,
  Stack
} from '@mui/material';
import { 
  Rocket, 
  ExternalLink, 
  ShieldCheck, 
  Bot,
  ArrowRight
} from 'lucide-react';

const HandoverDialog = ({ open, vendor, onConfirm }) => {
  const theme = useTheme();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    let timer;
    if (open && countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else if (open && countdown === 0) {
      // Auto-trigger if needed, or wait for click
    }
    return () => clearTimeout(timer);
  }, [open, countdown]);

  if (!vendor) return null;

  return (
    <Dialog 
      open={open} 
      maxWidth="xs" 
      fullWidth
      PaperProps={{
        sx: { borderRadius: 5, p: 1, textAlign: 'center' }
      }}
    >
      <DialogContent sx={{ p: 4 }}>
        <Stack spacing={3} alignItems="center">
          <Box 
            sx={{ 
              width: 80, 
              height: 80, 
              borderRadius: '50%', 
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 1
            }}
          >
            <Bot size={40} color={theme.palette.primary.main} className="animate-bounce" />
          </Box>

          <Box>
            <Typography variant="h5" fontWeight={800} gutterBottom>
              AI Agent Activated!
            </Typography>
            <Typography variant="body2" color="text.secondary">
              We are preparing your items and taking you to <strong>{vendor.name}</strong> for secure payment.
            </Typography>
          </Box>

          <Box sx={{ width: '100%', p: 2, bgcolor: 'grey.50', borderRadius: 3, border: '1px dashed', borderColor: 'divider' }}>
            <Stack direction="row" spacing={2} alignItems="center" justifyContent="center">
              <ShieldCheck size={18} color="green" />
              <Typography variant="caption" fontWeight={600}>
                Secure Handover in Progress...
              </Typography>
            </Stack>
          </Box>

          <Button
            fullWidth
            variant="contained"
            size="large"
            onClick={onConfirm}
            endIcon={<ArrowRight size={20} />}
            sx={{ 
              py: 1.5, 
              borderRadius: 3, 
              textTransform: 'none',
              fontSize: '1rem',
              fontWeight: 700,
              boxShadow: theme.shadows[4]
            }}
          >
            Go to {vendor.name} ({countdown}s)
          </Button>
          
          <Typography variant="caption" color="text.secondary">
            Your shopping list is being synced automatically.
          </Typography>
        </Stack>
      </DialogContent>
    </Dialog>
  );
};

export default HandoverDialog;
