import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Button, 
  Box, 
  Grid, 
  Paper, 
  Card, 
  CardContent, 
  CardMedia,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  useTheme,
  useMediaQuery,
  Chip,
  Tooltip,
  Link as MuiLink
} from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import LocalTaxiIcon from '@mui/icons-material/LocalTaxi';
import SecurityIcon from '@mui/icons-material/Security';
import SpeedIcon from '@mui/icons-material/Speed';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import StarIcon from '@mui/icons-material/Star';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import { useAuth } from '../context/AuthContext';
import { useJsApiLoader } from '@react-google-maps/api';

const Home = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [apiStatus, setApiStatus] = useState<'loading' | 'success' | 'error'>('loading');

  const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY || '';
  const libraries = (process.env.REACT_APP_GOOGLE_MAPS_LIBRARIES || 'places').split(',');
  
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: apiKey,
    libraries: libraries as any
  });

  useEffect(() => {
    if (loadError) {
      setApiStatus('error');
    } else if (isLoaded) {
      setApiStatus('success');
    } else {
      setApiStatus('loading');
    }
  }, [isLoaded, loadError]);

  const features = [
    {
      icon: <SecurityIcon fontSize="large" color="primary" />,
      title: "Safe & Secure",
      description: "All our drivers are verified and rides are tracked for your safety."
    },
    {
      icon: <SpeedIcon fontSize="large" color="primary" />,
      title: "Fast & Reliable",
      description: "Get to your destination quickly with our efficient routing system."
    },
    {
      icon: <AttachMoneyIcon fontSize="large" color="primary" />,
      title: "Affordable",
      description: "Competitive pricing with transparent fare estimates before you book."
    }
  ];

  const testimonials = [
    {
      name: "Sarah J.",
      comment: "RideShare has been my go-to for daily commutes. The drivers are professional and the app is so easy to use!",
      rating: 5
    },
    {
      name: "Michael T.",
      comment: "I love how I can schedule rides in advance. Perfect for airport pickups and important meetings.",
      rating: 5
    },
    {
      name: "Lisa R.",
      comment: "The fare estimates are accurate and the drivers always arrive on time. Highly recommended!",
      rating: 4
    }
  ];

  return (
    <Box>
      {/* API Status Indicator */}
      <Box sx={{ position: 'fixed', bottom: 16, right: 16, zIndex: 1000 }}>
        <Tooltip title={
          apiStatus === 'success' 
            ? "Google Maps API is working correctly" 
            : apiStatus === 'error'
              ? "There's an issue with the Google Maps API. Click for help."
              : "Loading Google Maps API..."
        }>
          <Chip
            icon={
              apiStatus === 'success' 
                ? <CheckCircleIcon /> 
                : apiStatus === 'error'
                  ? <ErrorIcon />
                  : <DirectionsCarIcon />
            }
            label={
              apiStatus === 'success' 
                ? "Maps API: OK" 
                : apiStatus === 'error'
                  ? "Maps API: Error"
                  : "Maps API: Loading..."
            }
            color={
              apiStatus === 'success' 
                ? "success" 
                : apiStatus === 'error'
                  ? "error"
                  : "default"
            }
            onClick={() => apiStatus === 'error' && navigate('/api-help')}
            clickable={apiStatus === 'error'}
            sx={{ boxShadow: 2 }}
          />
        </Tooltip>
      </Box>

      {/* Hero Section */}
      <Box 
        sx={{ 
          bgcolor: 'primary.main', 
          color: 'white', 
          py: 8,
          backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(https://source.unsplash.com/random/1600x900/?taxi,car)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ maxWidth: 600 }}>
            <Typography variant="h2" component="h1" gutterBottom fontWeight="bold">
              Your Ride, Your Way
            </Typography>
            <Typography variant="h5" paragraph sx={{ mb: 4 }}>
              Fast, reliable rides at your fingertips. Book a ride in seconds and get where you need to go.
            </Typography>
            <Button 
              variant="contained" 
              color="secondary" 
              size="large" 
              onClick={() => navigate(currentUser ? '/book' : '/login')}
              sx={{ 
                py: 1.5, 
                px: 4, 
                fontSize: '1.1rem',
                '&:hover': { transform: 'translateY(-2px)' },
                transition: 'transform 0.2s'
              }}
            >
              {currentUser ? 'Book a Ride Now' : 'Login to Book a Ride'}
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Main Options Section */}
      <Container maxWidth="lg">
        <Box sx={{ mt: 8, mb: 6 }}>
          <Grid container spacing={4} justifyContent="center">
            <Grid item xs={12} md={6}>
              <Paper
                elevation={3}
                sx={{
                  p: 4,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  cursor: 'pointer',
                  height: '100%',
                  '&:hover': { transform: 'translateY(-8px)', boxShadow: 6 },
                  transition: 'transform 0.3s, box-shadow 0.3s',
                }}
                onClick={() => navigate('/book')}
              >
                <LocalTaxiIcon sx={{ fontSize: 70, mb: 2, color: 'primary.main' }} />
                <Typography variant="h4" component="h2" gutterBottom>
                  Need a Ride?
                </Typography>
                <Typography align="center" color="text.secondary" paragraph sx={{ mb: 3 }}>
                  Book a ride now and get to your destination safely and comfortably. Our drivers are ready to pick you up.
                </Typography>
                <Button variant="contained" color="primary" size="large">
                  Book a Ride
                </Button>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper
                elevation={3}
                sx={{
                  p: 4,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  cursor: 'pointer',
                  height: '100%',
                  '&:hover': { transform: 'translateY(-8px)', boxShadow: 6 },
                  transition: 'transform 0.3s, box-shadow 0.3s',
                }}
                onClick={() => navigate('/register')}
              >
                <DirectionsCarIcon sx={{ fontSize: 70, mb: 2, color: 'secondary.main' }} />
                <Typography variant="h4" component="h2" gutterBottom>
                  Become a Driver
                </Typography>
                <Typography align="center" color="text.secondary" paragraph sx={{ mb: 3 }}>
                  Join our community of drivers and start earning on your own schedule. Be your own boss.
                </Typography>
                <Button variant="contained" color="secondary" size="large">
                  Register as Driver
                </Button>
              </Paper>
            </Grid>
          </Grid>
        </Box>

        {/* Features Section */}
        <Box sx={{ my: 8 }}>
          <Typography variant="h3" component="h2" align="center" gutterBottom>
            Why Choose RideShare?
          </Typography>
          <Divider sx={{ mb: 6, width: '80px', mx: 'auto', borderBottomWidth: 3, borderColor: 'primary.main' }} />
          
          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Box 
                  sx={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    textAlign: 'center',
                    p: 3
                  }}
                >
                  <Box sx={{ mb: 2 }}>{feature.icon}</Box>
                  <Typography variant="h5" component="h3" gutterBottom>
                    {feature.title}
                  </Typography>
                  <Typography color="text.secondary">
                    {feature.description}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Testimonials Section */}
        <Box sx={{ my: 8 }}>
          <Typography variant="h3" component="h2" align="center" gutterBottom>
            What Our Users Say
          </Typography>
          <Divider sx={{ mb: 6, width: '80px', mx: 'auto', borderBottomWidth: 3, borderColor: 'primary.main' }} />
          
          <Grid container spacing={4}>
            {testimonials.map((testimonial, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Card 
                  elevation={2}
                  sx={{ 
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    '&:hover': { transform: 'translateY(-5px)', boxShadow: 3 },
                    transition: 'transform 0.2s, box-shadow 0.2s',
                  }}
                >
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', mb: 2 }}>
                      {[...Array(5)].map((_, i) => (
                        <StarIcon 
                          key={i} 
                          sx={{ 
                            color: i < testimonial.rating ? 'gold' : 'text.disabled',
                            fontSize: '1.2rem'
                          }} 
                        />
                      ))}
                    </Box>
                    <Typography variant="body1" paragraph sx={{ fontStyle: 'italic', mb: 3 }}>
                      "{testimonial.comment}"
                    </Typography>
                    <Typography variant="subtitle1" color="text.secondary" fontWeight="bold">
                      - {testimonial.name}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* CTA Section */}
        <Box 
          sx={{ 
            my: 8, 
            p: 6, 
            bgcolor: 'primary.light', 
            borderRadius: 2,
            textAlign: 'center'
          }}
        >
          <Typography variant="h4" component="h2" gutterBottom>
            Ready to Get Started?
          </Typography>
          <Typography variant="body1" paragraph sx={{ mb: 4, maxWidth: 700, mx: 'auto' }}>
            Join thousands of satisfied users who rely on RideShare for their daily transportation needs.
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            size="large"
            onClick={() => navigate(currentUser ? '/book' : '/register')}
            sx={{ 
              py: 1.5, 
              px: 4, 
              fontSize: '1.1rem',
              '&:hover': { bgcolor: 'primary.dark' }
            }}
          >
            {currentUser ? 'Book Your Ride' : 'Sign Up Now'}
          </Button>
        </Box>

        {/* API Test Link */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="body2" color="text.secondary">
            Having issues with maps or location services?{' '}
            <MuiLink component={RouterLink} to="/api-test" underline="hover">
              Run API diagnostics
            </MuiLink>
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Home; 