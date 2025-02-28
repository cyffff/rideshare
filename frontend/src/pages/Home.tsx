import React from 'react';
import { Container, Typography, Button, Box, Grid, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import LocalTaxiIcon from '@mui/icons-material/LocalTaxi';

const Home = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 8, mb: 4 }}>
        <Typography variant="h2" component="h1" gutterBottom align="center">
          Welcome to RideShare
        </Typography>
        <Typography variant="h5" align="center" color="text.secondary" paragraph>
          Your trusted ride-sharing platform. Book a ride or become a driver today!
        </Typography>
        <Box sx={{ mt: 4 }}>
          <Grid container spacing={4} justifyContent="center">
            <Grid item xs={12} md={6}>
              <Paper
                sx={{
                  p: 4,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  cursor: 'pointer',
                  '&:hover': { transform: 'scale(1.02)' },
                  transition: 'transform 0.2s',
                }}
                onClick={() => navigate('/book-ride')}
              >
                <LocalTaxiIcon sx={{ fontSize: 60, mb: 2, color: 'primary.main' }} />
                <Typography variant="h5" component="h2" gutterBottom>
                  Need a Ride?
                </Typography>
                <Typography align="center" color="text.secondary" paragraph>
                  Book a ride now and get to your destination safely and comfortably.
                </Typography>
                <Button variant="contained" color="primary" size="large">
                  Book a Ride
                </Button>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper
                sx={{
                  p: 4,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  cursor: 'pointer',
                  '&:hover': { transform: 'scale(1.02)' },
                  transition: 'transform 0.2s',
                }}
                onClick={() => navigate('/register')}
              >
                <DirectionsCarIcon sx={{ fontSize: 60, mb: 2, color: 'secondary.main' }} />
                <Typography variant="h5" component="h2" gutterBottom>
                  Become a Driver
                </Typography>
                <Typography align="center" color="text.secondary" paragraph>
                  Join our community of drivers and start earning on your own schedule.
                </Typography>
                <Button variant="contained" color="secondary" size="large">
                  Register as Driver
                </Button>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Container>
  );
};

export default Home; 