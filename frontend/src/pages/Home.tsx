import React, { useState } from 'react';
import {
  Container,
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardMedia,
  useTheme,
  Paper,
  Divider,
  Avatar,
  alpha,
  TextField,
  InputAdornment,
  FormControl,
  Select,
  MenuItem,
  SelectChangeEvent
} from '@mui/material';
import {
  DirectionsCar,
  AccessTime,
  CreditCard,
  Star,
  LocalTaxi,
  Speed,
  Security,
  SupervisorAccount,
  LocationOn,
  MyLocation,
  Place,
  ArrowForward
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme';

const Home: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [pickupLocation, setPickupLocation] = useState('');
  const [dropoffLocation, setDropoffLocation] = useState('');
  const [carType, setCarType] = useState('economy');

  const handleCarTypeChange = (event: SelectChangeEvent) => {
    setCarType(event.target.value as string);
  };

  const handleQuickBook = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    // Navigate to book ride with pre-filled info
    navigate('/book-ride', { 
      state: { 
        pickupLocation, 
        dropoffLocation,
        carType
      } 
    });
  };

  const features = [
    {
      title: 'Quick Booking',
      description: 'Book a ride in seconds with our streamlined booking process.',
      icon: <AccessTime fontSize="large" sx={{ color: theme.palette.primary.main }} />
    },
    {
      title: 'Secure Payments',
      description: 'Payments are secure and can be made with credit cards or PayPal.',
      icon: <CreditCard fontSize="large" sx={{ color: theme.palette.primary.main }} />
    },
    {
      title: 'Top Rated Drivers',
      description: 'Our drivers are carefully vetted and highly rated by users.',
      icon: <Star fontSize="large" sx={{ color: theme.palette.primary.main }} />
    },
    {
      title: 'Real-time Tracking',
      description: 'Track your ride in real-time and share your journey with loved ones.',
      icon: <LocationOn fontSize="large" sx={{ color: theme.palette.primary.main }} />
    }
  ];

  const carTypes = [
    {
      name: 'Economy',
      description: 'Affordable rides for everyday use',
      imageUrl: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      icon: <LocalTaxi />,
      price: 'From $10'
    },
    {
      name: 'Comfort',
      description: 'Newer cars with extra legroom',
      imageUrl: 'https://images.unsplash.com/photo-1550355291-bbee04a92027?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      icon: <DirectionsCar />,
      price: 'From $15'
    },
    {
      name: 'Premium',
      description: 'Luxury vehicles with top-rated drivers',
      imageUrl: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      icon: <Speed />,
      price: 'From $25'
    }
  ];

  const testimonials = [
    {
      name: 'Emily Johnson',
      text: 'The app is so easy to use! I love the real-time tracking feature that lets me share my journey with family.',
      rating: 5,
      avatar: 'E'
    },
    {
      name: 'Michael Chen',
      text: 'Great service and professional drivers. The ability to schedule rides in advance is super helpful for my business trips.',
      rating: 4,
      avatar: 'M'
    },
    {
      name: 'Sarah Williams',
      text: 'I feel safe using this ride service even late at night. The drivers are courteous and the cars are always clean.',
      rating: 5,
      avatar: 'S'
    }
  ];

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          height: '90vh',
          background: theme.palette.mode === 'dark'
            ? `linear-gradient(rgba(10, 35, 66, 0.8), rgba(10, 35, 66, 0.9)), url('https://images.unsplash.com/photo-1485832329521-e944d75fa65e?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80')`
            : `linear-gradient(rgba(35, 100, 170, 0.7), rgba(10, 35, 66, 0.85)), url('https://images.unsplash.com/photo-1485832329521-e944d75fa65e?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
          display: 'flex',
          alignItems: 'center',
          color: 'white',
          position: 'relative'
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: { xs: '100%', md: '50%' },
            height: '100%',
            background: `radial-gradient(circle at 70% 50%, ${alpha(theme.palette.primary.main, 0.2)} 0%, transparent 70%)`,
            zIndex: 0
          }}
        />
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Typography 
                variant="h2" 
                component="h1" 
                fontWeight="bold" 
                gutterBottom
                sx={{ 
                  fontSize: { xs: '2.5rem', sm: '3.5rem', md: '4rem' },
                  textShadow: '0 2px 10px rgba(0,0,0,0.3)',
                  lineHeight: 1.1,
                  mb: 2
                }}
              >
                Your Ride, <br />
                <Box component="span" sx={{ color: theme.palette.secondary.light }}>Your Way</Box>
              </Typography>
              <Typography 
                variant="h5" 
                sx={{ 
                  mb: 4, 
                  fontWeight: 300,
                  color: 'rgba(255, 255, 255, 0.9)',
                  maxWidth: '600px',
                  lineHeight: 1.4
                }}
              >
                Fast, reliable rides for any destination. Book in seconds, travel in comfort, arrive on time.
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, mt: 4, flexWrap: { xs: 'wrap', sm: 'nowrap' } }}>
                <Button
                  variant="contained"
                  size="large"
                  color="secondary"
                  onClick={() => navigate('/book-ride')}
                  sx={{ 
                    px: 4, 
                    py: 1.75,
                    fontSize: '1.1rem',
                    borderRadius: '30px',
                    fontWeight: 600,
                    boxShadow: '0 8px 20px rgba(234, 115, 23, 0.3)',
                    flexGrow: { xs: 1, sm: 0 }
                  }}
                  endIcon={<ArrowForward />}
                >
                  Book a Ride
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  sx={{ 
                    px: 4, 
                    py: 1.75,
                    fontSize: '1.1rem',
                    borderRadius: '30px',
                    fontWeight: 600,
                    color: 'white',
                    borderColor: 'white',
                    borderWidth: '2px',
                    '&:hover': {
                      borderColor: 'white',
                      borderWidth: '2px',
                      backgroundColor: 'rgba(255,255,255,0.1)'
                    },
                    flexGrow: { xs: 1, sm: 0 }
                  }}
                  onClick={() => navigate('/driver-dashboard')}
                >
                  Drive With Us
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Quick Booking Section */}
      <Container maxWidth="lg" sx={{ mt: -5, mb: 8, position: 'relative', zIndex: 2 }}>
        <Paper 
          elevation={6} 
          sx={{ 
            p: 4, 
            borderRadius: 3,
            backgroundColor: 'white'
          }}
        >
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h5" component="h2" fontWeight="bold" gutterBottom>
                Quick Booking
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Enter your pickup and destination to get started
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Pickup Location"
                value={pickupLocation}
                onChange={(e) => setPickupLocation(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <MyLocation color="primary" />
                    </InputAdornment>
                  ),
                }}
                placeholder="Enter pickup location"
              />
            </Grid>
            
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Destination"
                value={dropoffLocation}
                onChange={(e) => setDropoffLocation(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Place color="primary" />
                    </InputAdornment>
                  ),
                }}
                placeholder="Enter drop-off location"
              />
            </Grid>
            
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <Select
                  value={carType}
                  onChange={handleCarTypeChange}
                  displayEmpty
                >
                  <MenuItem value="economy">Economy</MenuItem>
                  <MenuItem value="comfort">Comfort</MenuItem>
                  <MenuItem value="premium">Premium</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sx={{ mt: 2, textAlign: 'center' }}>
              <Button
                variant="contained"
                size="large"
                onClick={handleQuickBook}
                sx={{ 
                  minWidth: '200px',
                  borderRadius: '30px',
                  py: 1.5
                }}
              >
                Find a Ride
              </Button>
            </Grid>
          </Grid>
        </Paper>
      </Container>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 10 }}>
        <Box textAlign="center" mb={8}>
          <Typography variant="h3" component="h2" fontWeight="bold" gutterBottom>
            Why Choose Us
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
            Experience the future of transportation with our feature-rich ride-sharing platform.
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 4, 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  textAlign: 'center',
                  borderRadius: 4,
                  transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: 6
                  }
                }}
              >
                <Box mb={2}>
                  {feature.icon}
                </Box>
                <Typography variant="h5" component="h3" gutterBottom fontWeight="bold">
                  {feature.title}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {feature.description}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Car Types Section */}
      <Box sx={{ backgroundColor: alpha(theme.palette.primary.main, 0.05), py: 10 }}>
        <Container maxWidth="lg">
          <Box textAlign="center" mb={8}>
            <Typography variant="h3" component="h2" fontWeight="bold" gutterBottom>
              Our Ride Options
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
              Choose the perfect ride for your needs, from budget-friendly to premium luxury.
            </Typography>
          </Box>

          <Grid container spacing={4}>
            {carTypes.map((carType, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Card 
                  sx={{ 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column',
                    borderRadius: 4, 
                    overflow: 'hidden',
                    transition: 'transform 0.3s ease-in-out',
                    '&:hover': {
                      transform: 'scale(1.03)'
                    }
                  }}
                >
                  <CardMedia
                    component="img"
                    height="200"
                    image={carType.imageUrl}
                    alt={carType.name}
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box display="flex" alignItems="center" mb={1}>
                      <Box sx={{ 
                        p: 1, 
                        borderRadius: '50%', 
                        backgroundColor: theme.palette.primary.main, 
                        color: 'white',
                        mr: 2
                      }}>
                        {carType.icon}
                      </Box>
                      <Typography variant="h5" component="h3" fontWeight="bold">
                        {carType.name}
                      </Typography>
                    </Box>
                    <Typography variant="body1" paragraph color="text.secondary">
                      {carType.description}
                    </Typography>
                    <Typography variant="h6" color="primary" fontWeight="bold">
                      {carType.price}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          <Box textAlign="center" mt={6}>
            <Button 
              variant="contained" 
              size="large" 
              onClick={() => navigate('/book-ride')}
              sx={{ 
                px: 4, 
                py: 1.5,
                borderRadius: 2
              }}
            >
              Book Now
            </Button>
          </Box>
        </Container>
      </Box>

      {/* How It Works Section */}
      <Container maxWidth="lg" sx={{ py: 10 }}>
        <Box textAlign="center" mb={8}>
          <Typography variant="h3" component="h2" fontWeight="bold" gutterBottom>
            How It Works
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
            Getting a ride has never been easier. Just follow these simple steps.
          </Typography>
        </Box>

        <Grid container spacing={4} alignItems="center">
          <Grid item xs={12} md={6}>
            <Box component="img" src="https://images.unsplash.com/photo-1551650975-87deedd944c3?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80" alt="Mobile app" sx={{ width: '100%', borderRadius: 4, boxShadow: 4 }} />
          </Grid>
          <Grid item xs={12} md={6}>
            <Box>
              <Box display="flex" alignItems="flex-start" mb={4}>
                <Box 
                  sx={{ 
                    minWidth: 40, 
                    height: 40, 
                    borderRadius: '50%', 
                    backgroundColor: theme.palette.primary.main, 
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold',
                    mr: 2
                  }}
                >
                  1
                </Box>
                <Box>
                  <Typography variant="h5" gutterBottom fontWeight="bold">
                    Enter Your Location
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Use the app to enter your pickup location and destination. You can either type the address or select it directly on the map.
                  </Typography>
                </Box>
              </Box>

              <Box display="flex" alignItems="flex-start" mb={4}>
                <Box 
                  sx={{ 
                    minWidth: 40, 
                    height: 40, 
                    borderRadius: '50%', 
                    backgroundColor: theme.palette.primary.main, 
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold',
                    mr: 2
                  }}
                >
                  2
                </Box>
                <Box>
                  <Typography variant="h5" gutterBottom fontWeight="bold">
                    Choose Your Ride
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Select from different ride options based on your preference and budget. See the estimated price and arrival time before confirming.
                  </Typography>
                </Box>
              </Box>

              <Box display="flex" alignItems="flex-start">
                <Box 
                  sx={{ 
                    minWidth: 40, 
                    height: 40, 
                    borderRadius: '50%', 
                    backgroundColor: theme.palette.primary.main, 
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold',
                    mr: 2
                  }}
                >
                  3
                </Box>
                <Box>
                  <Typography variant="h5" gutterBottom fontWeight="bold">
                    Track & Enjoy Your Ride
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Watch your driver arrive in real-time on the map. After the ride, rate your experience and provide feedback.
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Container>

      {/* Testimonials Section */}
      <Box sx={{ backgroundColor: alpha(theme.palette.primary.main, 0.05), py: 10 }}>
        <Container maxWidth="lg">
          <Box textAlign="center" mb={8}>
            <Typography variant="h3" component="h2" fontWeight="bold" gutterBottom>
              What Our Customers Say
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
              Don't just take our word for it. Here's what our customers have to say about their experiences.
            </Typography>
          </Box>

          <Grid container spacing={4}>
            {testimonials.map((testimonial, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Paper 
                  elevation={2} 
                  sx={{ 
                    p: 4, 
                    height: '100%', 
                    borderRadius: 4,
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                >
                  <Box display="flex" alignItems="center" mb={2}>
                    <Avatar 
                      sx={{ 
                        bgcolor: theme.palette.primary.main, 
                        width: 56, 
                        height: 56,
                        mr: 2 
                      }}
                    >
                      {testimonial.avatar}
                    </Avatar>
                    <Box>
                      <Typography variant="h6" fontWeight="bold">
                        {testimonial.name}
                      </Typography>
                      <Box display="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} sx={{ 
                            color: i < testimonial.rating ? '#FFD700' : 'grey.300',
                            fontSize: '1rem'
                          }} />
                        ))}
                      </Box>
                    </Box>
                  </Box>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="body1" sx={{ flexGrow: 1 }}>
                    "{testimonial.text}"
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box
        sx={{
          py: 10,
          background: `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url('https://images.unsplash.com/photo-1574725466569-eea7d27b0e76?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          color: 'white',
          textAlign: 'center'
        }}
      >
        <Container maxWidth="md">
          <Typography variant="h3" component="h2" fontWeight="bold" gutterBottom>
            Ready to Get Started?
          </Typography>
          <Typography variant="h6" sx={{ mb: 4, maxWidth: 700, mx: 'auto', fontWeight: 300 }}>
            Join thousands of satisfied customers who rely on our service for their daily commute and travel needs.
          </Typography>
          <Box sx={{ display: 'flex', gap: 3, justifyContent: 'center' }}>
            <Button
              variant="contained"
              size="large"
              color="primary"
              onClick={() => navigate('/book-ride')}
              sx={{ 
                px: 4, 
                py: 1.5,
                fontSize: '1.1rem',
                borderRadius: 2
              }}
            >
              Book Your First Ride
            </Button>
            <Button
              variant="outlined"
              size="large"
              onClick={() => navigate('/ride-history')}
              sx={{ 
                px: 4, 
                py: 1.5,
                fontSize: '1.1rem',
                borderRadius: 2,
                color: 'white',
                borderColor: 'white',
                '&:hover': {
                  borderColor: 'white',
                  backgroundColor: 'rgba(255,255,255,0.1)'
                }
              }}
            >
              View Ride History
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Safety Section */}
      <Container maxWidth="lg" sx={{ py: 10 }}>
        <Grid container spacing={6} alignItems="center">
          <Grid item xs={12} md={6}>
            <Typography variant="h3" component="h2" fontWeight="bold" gutterBottom>
              Your Safety is Our Priority
            </Typography>
            <Typography variant="body1" paragraph color="text.secondary" sx={{ mb: 4 }}>
              We've implemented comprehensive safety measures to ensure you have peace of mind with every ride. From driver background checks to real-time trip monitoring, we've got you covered.
            </Typography>
            
            <Box display="flex" alignItems="flex-start" mb={3}>
              <Security color="primary" sx={{ fontSize: 32, mr: 2, mt: 0.5 }} />
              <Box>
                <Typography variant="h6" fontWeight="bold">
                  Driver Verification
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  All drivers undergo thorough background checks and vehicle inspections.
                </Typography>
              </Box>
            </Box>
            
            <Box display="flex" alignItems="flex-start" mb={3}>
              <SupervisorAccount color="primary" sx={{ fontSize: 32, mr: 2, mt: 0.5 }} />
              <Box>
                <Typography variant="h6" fontWeight="bold">
                  Trip Sharing
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Share your trip details and real-time location with trusted contacts.
                </Typography>
              </Box>
            </Box>
            
            <Box display="flex" alignItems="flex-start">
              <Speed color="primary" sx={{ fontSize: 32, mr: 2, mt: 0.5 }} />
              <Box>
                <Typography variant="h6" fontWeight="bold">
                  24/7 Support
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Our support team is available around the clock to assist with any issues.
                </Typography>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box component="img" src="https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80" alt="Safety" sx={{ width: '100%', borderRadius: 4, boxShadow: 4 }} />
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Home; 