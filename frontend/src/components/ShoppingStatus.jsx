import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
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
  Button,
  IconButton,
  alpha,
  useTheme
} from '@mui/material';
import { 
  CheckCircle2, 
  Loader2, 
  ShoppingCart, 
  BrainCircuit,
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  X
} from 'lucide-react';
import axios from 'axios';

const ShoppingStatus = ({ active, onClose, items = [], vendor = null }) => {
  const theme = useTheme();
  const [status, setStatus] = useState({
    is_running: false,
    current_item: "",
    progress: 0,
    total_items: 0,
    logs: []
  });
  const [activeItemIndex, setActiveItemIndex] = useState(0);

  useEffect(() => {
    let interval;
    if (active) {
      interval = setInterval(async () => {
        try {
          const response = await axios.get('https://ahmadhossan-florland-ai-agent.hf.space/agent/status');
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

  const handleShopItem = (index) => {
    if (!items || !items[index]) return;
    setActiveItemIndex(index);
    const itemText = items[index].text;
    const encoded = encodeURIComponent(itemText);
    const url = vendor?.id === 'walmart'
      ? `https://www.walmart.com/search?q=${encoded}`
      : `https://www.instacart.com/store/s?k=${encoded}`;
    window.open(url, '_blank');
  };

  if (!active && !status.is_running) return null;

  return (
    <Paper 
      elevation={6}
      sx={{ 
        position: 'fixed', 
        bottom: 24, 
        right: 24, 
        width: 360, 
        borderRadius: 4, 
        overflow: 'hidden',
        zIndex: 1000,
        border: '1px solid',
        borderColor: 'primary.main',
        bgcolor: alpha(theme.palette.background.paper, 0.95),
        backdropFilter: 'blur(10px)',
        boxShadow: `0 12px 35px ${alpha(theme.palette.common.black, 0.3)}`
      }}
    >
      <Box sx={{ 
        p: 2, 
        position: 'relative',
        bgcolor: status.requires_action ? alpha(theme.palette.error.main, 0.1) : alpha(theme.palette.primary.main, 0.08), 
        borderBottom: '1px solid', 
        borderColor: status.requires_action ? 'error.main' : 'divider' 
      }}>
        {onClose && (
          <IconButton 
            size="small" 
            onClick={onClose}
            sx={{ position: 'absolute', top: 12, right: 12, color: 'text.secondary' }}
          >
            <X size={18} />
          </IconButton>
        )}

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1, pr: 4 }}>
          {status.requires_action ? (
            <AlertCircle size={20} color={theme.palette.error.main} className="animate-pulse" />
          ) : status.is_running ? (
            <Loader2 className="animate-spin" size={20} color={theme.palette.primary.main} />
          ) : (
            <CheckCircle2 size={20} color={theme.palette.success.main} />
          )}
          <Typography variant="subtitle1" fontWeight={700} color={status.requires_action ? 'error.main' : 'inherit'}>
            {status.requires_action ? "Action Required!" : status.is_running ? "AI Agent Shopping..." : "Shopping Session Active"}
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
          {status.progress} of {status.total_items} items background processed
        </Typography>
      </Box>

      {/* Step-by-Step Shopping Assistant Panel */}
      {items && items.length > 0 && vendor && (
        <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider', bgcolor: alpha(theme.palette.background.default, 0.6) }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
            <Typography variant="subtitle2" fontWeight={700} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <ShoppingCart size={16} color={theme.palette.primary.main} />
              Shopping Assistant ({activeItemIndex + 1}/{items.length})
            </Typography>
            <Chip 
              label={vendor.name} 
              size="small" 
              sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 700, fontSize: '0.7rem' }} 
            />
          </Box>

          <Paper variant="outlined" sx={{ p: 1.5, mb: 1.5, borderRadius: 2, bgcolor: 'background.paper', borderColor: 'primary.light' }}>
            <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
              CURRENT ITEM TO ADD:
            </Typography>
            <Typography variant="body1" fontWeight={800} color="primary.main">
              {items[activeItemIndex]?.text}
            </Typography>
          </Paper>

          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              size="small"
              disabled={activeItemIndex === 0}
              onClick={() => handleShopItem(activeItemIndex - 1)}
              sx={{ minWidth: 40, px: 1, borderRadius: 2 }}
              title="Previous Item"
            >
              <ArrowLeft size={16} />
            </Button>
            <Button
              variant="contained"
              size="small"
              fullWidth
              onClick={() => handleShopItem(activeItemIndex)}
              sx={{ borderRadius: 2, fontWeight: 700, py: 1, boxShadow: 2 }}
            >
              Shop Item on {vendor.name}
            </Button>
            <Button
              variant="contained"
              color="secondary"
              size="small"
              disabled={activeItemIndex >= items.length - 1}
              onClick={() => handleShopItem(activeItemIndex + 1)}
              sx={{ minWidth: 40, px: 1, borderRadius: 2 }}
              title="Next Item"
            >
              <ArrowRight size={16} />
            </Button>
          </Box>
        </Box>
      )}

      <Box sx={{ p: 1, maxHeight: 150, overflowY: 'auto' }}>
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
    </Paper>
  );
};

ShoppingStatus.propTypes = {
  active: PropTypes.bool.isRequired,
  onClose: PropTypes.func,
  items: PropTypes.array,
  vendor: PropTypes.object
};

export default ShoppingStatus;
