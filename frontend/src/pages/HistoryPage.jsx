import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Chip,
  IconButton,
  Collapse,
  List,
  ListItem,
  ListItemText,
  alpha,
  useTheme,
  CircularProgress
} from '@mui/material';
import { 
  ChevronDown, 
  ChevronUp, 
  Calendar, 
  Store, 
  ShoppingCart,
  ExternalLink,
  History
} from 'lucide-react';
import axios from 'axios';

const Row = ({ session }) => {
  const [open, setOpen] = useState(false);
  const theme = useTheme();

  return (
    <React.Fragment>
      <TableRow sx={{ '& > *': { borderBottom: 'unset' }, cursor: 'pointer' }} onClick={() => setOpen(!open)}>
        <TableCell>
          <IconButton size="small">
            {open ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </IconButton>
        </TableCell>
        <TableCell component="th" scope="row">
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Calendar size={16} color={theme.palette.text.secondary} />
            <Typography variant="body2" fontWeight={600}>
              {new Date(session.createdAt).toLocaleDateString('en-US', { 
                month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' 
              })}
            </Typography>
          </Box>
        </TableCell>
        <TableCell>
          <Chip 
            icon={<Store size={14} />} 
            label={session.storeName} 
            variant="outlined" 
            size="small"
            sx={{ fontWeight: 600, border: '1.5px solid' }}
          />
        </TableCell>
        <TableCell align="center">
          <Typography variant="body2" fontWeight={700}>
            {session.itemsCount} items
          </Typography>
        </TableCell>
        <TableCell align="right">
          <Chip 
            label={session.status.toUpperCase()} 
            color={session.status === 'completed' ? 'success' : 'primary'}
            size="small"
            sx={{ fontSize: '0.65rem', fontWeight: 800 }}
          />
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 2, p: 2, bgcolor: alpha(theme.palette.primary.main, 0.02), borderRadius: 2 }}>
              <Typography variant="subtitle2" gutterBottom fontWeight={800} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <ShoppingCart size={16} /> Shopping List Snapshot
              </Typography>
              <List dense>
                {session.itemsSnapshot.map((item, index) => (
                  <ListItem key={index}>
                    <ListItemText 
                      primary={`${item.count}x ${item.name}`} 
                      secondary={item.category}
                      primaryTypographyProps={{ variant: 'body2', fontWeight: 600 }}
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </React.Fragment>
  );
};

const HistoryPage = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const theme = useTheme();

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await axios.get('http://localhost:3001/api/sessions/history', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        if (response.data.success) {
          setSessions(response.data.sessions);
        }
      } catch (error) {
        console.error("Error fetching history:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box sx={{ p: 1.5, bgcolor: alpha(theme.palette.primary.main, 0.1), borderRadius: 3 }}>
          <History size={32} color={theme.palette.primary.main} />
        </Box>
        <Box>
          <Typography variant="h4" fontWeight={900}>Shopping History</Typography>
          <Typography variant="body2" color="text.secondary">Review your past AI-automated shopping sessions</Typography>
        </Box>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : sessions.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 4, border: '2px dashed', borderColor: 'divider' }}>
          <Typography variant="h6" color="text.secondary">No shopping sessions found yet.</Typography>
          <Typography variant="body2" color="text.secondary">Your history will appear here once you use the "Checkout with AI" feature.</Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper} sx={{ borderRadius: 4, overflow: 'hidden', boxShadow: theme.shadows[3] }}>
          <Table aria-label="shopping history table">
            <TableHead sx={{ bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
              <TableRow>
                <TableCell />
                <TableCell sx={{ fontWeight: 800 }}>Date</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>Store</TableCell>
                <TableCell align="center" sx={{ fontWeight: 800 }}>Items</TableCell>
                <TableCell align="right" sx={{ fontWeight: 800 }}>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sessions.map((session) => (
                <Row key={session._id} session={session} />
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Container>
  );
};

export default HistoryPage;
