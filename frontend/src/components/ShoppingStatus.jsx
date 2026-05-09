import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  LinearProgress, 
  Paper, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText,
  Chip,
  alpha,
  useTheme
} from '@mui/material';
import { 
  CheckCircle2, 
  Loader2, 
  ShoppingCart, 
  BrainCircuit,
  AlertCircle
} from 'lucide-react';
import axios from 'axios';

const ShoppingStatus = ({ active }) => {
  const theme = useTheme();
  const [status, setStatus] = useState({
    is_running: false,
    current_item: "",
    progress: 0,
    total_items: 0,
    logs: []
  });

  useEffect(() => {
    let interval;
    if (active) {
      interval = setInterval(async () => {
        try {
          const response = await axios.get('http://localhost:8000/agent/status');
          setStatus(response.data);
          if (!response.data.is_running && response.data.progress > 0) {
            clearInterval(interval);
          }
        } catch (error) {
          console.error("Error fetching status:", error);
        }
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [active]);

  if (!active && !status.is_running) return null;

  return (
    <Paper 
      elevation={4}
      sx={{ 
        position: 'fixed', 
        bottom: 24, 
        right: 24, 
        width: 320, 
        borderRadius: 4, 
        overflow: 'hidden',
        zIndex: 1000,
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: alpha(theme.palette.background.paper, 0.95),
        backdropFilter: 'blur(10px)',
      }}
    >
      <Box sx={{ 
        p: 2, 
        bgcolor: status.requires_action ? alpha(theme.palette.error.main, 0.1) : alpha(theme.palette.primary.main, 0.05), 
        borderBottom: '1px solid', 
        borderColor: status.requires_action ? 'error.main' : 'divider' 
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
          {status.requires_action ? (
            <AlertCircle size={20} color={theme.palette.error.main} className="animate-pulse" />
          ) : status.is_running ? (
            <Loader2 className="animate-spin" size={20} color={theme.palette.primary.main} />
          ) : (
            <CheckCircle2 size={20} color={theme.palette.success.main} />
          )}
          <Typography variant="subtitle1" fontWeight={700} color={status.requires_action ? 'error.main' : 'inherit'}>
            {status.requires_action ? "Action Required!" : status.is_running ? "AI Agent Shopping..." : "Shopping Complete"}
          </Typography>
        </Box>
        {status.requires_action && (
          <Typography variant="caption" fontWeight={700} sx={{ display: 'block', mb: 1, color: 'error.main' }}>
            Please solve the Captcha in the browser window to continue.
          </Typography>
        )}
        <LinearProgress 
          variant="determinate" 
          value={status.total_items > 0 ? (status.progress / status.total_items) * 100 : 0} 
          sx={{ height: 6, borderRadius: 3 }}
        />
        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
          {status.progress} of {status.total_items} items processed
        </Typography>
      </Box>

      <Box sx={{ p: 1, maxHeight: 200, overflowY: 'auto' }}>
        <List dense>
          {status.logs.slice(-5).map((log, index) => (
            <ListItem key={index}>
              <ListItemIcon sx={{ minWidth: 32 }}>
                {log.includes('✅') ? <CheckCircle2 size={16} color="green" /> : 
                 log.includes('❌') ? <AlertCircle size={16} color="red" /> :
                 <BrainCircuit size={16} color="blue" />}
              </ListItemIcon>
              <ListItemText 
                primary={log.replace(/^[✅❌⚠️]\s*/, '')} 
                primaryTypographyProps={{ variant: 'caption', fontWeight: 500 }}
              />
            </ListItem>
          ))}
        </List>
      </Box>
      
      {status.current_item && status.is_running && (
        <Box sx={{ p: 1.5, textAlign: 'center', borderTop: '1px solid', borderColor: 'divider' }}>
          <Chip 
            label={`Searching: ${status.current_item}`} 
            size="small" 
            variant="outlined" 
            sx={{ fontWeight: 600 }}
          />
        </Box>
      )}
    </Paper>
  );
};

export default ShoppingStatus;
