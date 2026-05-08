import React from 'react';
import PropTypes from 'prop-types';
import { 
  Box, 
  Button, 
  Container, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  Stack, 
  useTheme, 
  alpha 
} from '@mui/material';
import { 
  Mic, 
  ShoppingCart, 
  Wand2, 
  Zap, 
  ShieldCheck, 
  ChevronRight 
} from 'lucide-react';

const LandingPage = ({ onGetStarted }) => {
  const theme = useTheme();

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Hero Section */}
      <Box 
        sx={{ 
          pt: 15, 
          pb: 10, 
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={7}>
              <Box sx={{ position: 'relative', zIndex: 1 }}>
                <Typography 
                  variant="overline" 
                  sx={{ 
                    fontWeight: 700, 
                    color: 'primary.main', 
                    letterSpacing: 2,
                    mb: 2,
                    display: 'block'
                  }}
                >
                  INTRODUCING FLORLAND
                </Typography>
                <Typography 
                  variant="h1" 
                  sx={{ 
                    fontWeight: 800, 
                    fontSize: { xs: '3rem', md: '4.5rem' },
                    lineHeight: 1.1,
                    mb: 3,
                    background: `linear-gradient(45deg, ${theme.palette.text.primary} 30%, ${theme.palette.primary.main} 100%)`,
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  Your Grocery Shopping, <br />
                  <span style={{ color: theme.palette.primary.main }}>Fully Automated.</span>
                </Typography>
                <Typography 
                  variant="h5" 
                  sx={{ color: 'text.secondary', mb: 5, fontWeight: 400, maxWidth: 600 }}
                >
                  Speak your list, and let our AI agents handle the rest. From finding the best prices to automated checkout on Instacart and Walmart.
                </Typography>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <Button 
                    variant="contained" 
                    size="large" 
                    onClick={onGetStarted}
                    endIcon={<ChevronRight />}
                    sx={{ 
                      px: 4, 
                      py: 2, 
                      borderRadius: 3, 
                      fontSize: '1.1rem',
                      boxShadow: `0 8px 25px ${alpha(theme.palette.primary.main, 0.4)}`
                    }}
                  >
                    Start Shopping Now
                  </Button>
                  <Button 
                    variant="outlined" 
                    size="large" 
                    sx={{ px: 4, py: 2, borderRadius: 3, fontSize: '1.1rem' }}
                  >
                    How it Works
                  </Button>
                </Stack>
              </Box>
            </Grid>
            <Grid item xs={12} md={5}>
              <Box 
                sx={{ 
                  position: 'relative',
                  display: { xs: 'none', md: 'block' }
                }}
              >
                <Box 
                  sx={{ 
                    width: 450, 
                    height: 450, 
                    borderRadius: '50%', 
                    background: `linear-gradient(45deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                    filter: 'blur(80px)',
                    opacity: 0.1,
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)'
                  }}
                />
                <Card 
                  sx={{ 
                    borderRadius: 5, 
                    p: 3, 
                    boxShadow: '0 25px 50px -12px rgba(0,0,0,0.1)',
                    border: '1px solid',
                    borderColor: alpha(theme.palette.divider, 0.1),
                    backdropFilter: 'blur(10px)',
                    bgcolor: alpha(theme.palette.background.paper, 0.8)
                  }}
                >
                  <Stack spacing={2}>
                    <Box sx={{ p: 2, bgcolor: alpha(theme.palette.primary.main, 0.1), borderRadius: 3 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: 'primary.main', mb: 1 }}>
                        Listening...
                      </Typography>
                      <Typography variant="body1" sx={{ fontStyle: 'italic' }}>
                        "I need two gallons of organic milk, a dozen eggs, and some avocados from Instacart."
                      </Typography>
                    </Box>
                    <Divider />
                    <Stack spacing={1}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Typography variant="body2" fontWeight={600}>AI Processing</Typography>
                        <Zap size={16} color={theme.palette.success.main} />
                      </Box>
                      <Typography variant="caption" color="text.secondary">
                        Identifying items and mapping to Instacart inventory...
                      </Typography>
                    </Stack>
                  </Stack>
                </Card>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features Grid */}
      <Container maxWidth="lg" sx={{ py: 10 }}>
        <Grid container spacing={4}>
          {[
            { title: 'Voice Intelligence', desc: 'Natural language processing that understands complex grocery lists.', icon: Mic },
            { title: 'Auto-Checkout', desc: 'AI agents that navigate and fill your cart autonomously.', icon: Wand2 },
            { title: 'Affiliate Savings', desc: 'Integrated with top vendors to find the best deals and coupons.', icon: ShoppingCart },
            { title: 'Secure & Private', desc: 'Your data is encrypted and transactions are handled via trusted vendors.', icon: ShieldCheck },
          ].map((feat, i) => (
            <Grid item xs={12} sm={6} md={3} key={i}>
              <Card 
                sx={{ 
                  height: '100%', 
                  borderRadius: 4, 
                  transition: 'transform 0.3s ease',
                  '&:hover': { transform: 'translateY(-10px)' }
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  <Box 
                    sx={{ 
                      width: 48, 
                      height: 48, 
                      borderRadius: 2, 
                      bgcolor: alpha(theme.palette.primary.main, 0.1),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mb: 2,
                      color: 'primary.main'
                    }}
                  >
                    <feat.icon size={24} />
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>{feat.title}</Typography>
                  <Typography variant="body2" color="text.secondary">{feat.desc}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

const Divider = () => <Box sx={{ height: '1px', bgcolor: 'divider', my: 2 }} />;

LandingPage.propTypes = {
  onGetStarted: PropTypes.func.isRequired,
};

export default LandingPage;
