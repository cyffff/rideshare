import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  Divider,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Alert,
  Chip,
} from '@mui/material';
import {
  DirectionsCar,
  AccessTime,
  LocationOn,
  ArrowForward,
  Add,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface Ride {
  id: string;
  date: string;
  pickupLocation: string;
  dropoffLocation: string;
  status: 'COMPLETED' | 'CANCELLED' | 'SCHEDULED' | 'IN_PROGRESS';
  price: number;
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [rides, setRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Redirect to login if user is not authenticated
    if (!currentUser) {
      navigate('/login', { state: { from: '/dashboard' } });
      return;
    }

    const fetchRides = async () => {
      try {
        setLoading(true);
        setError(null);

        // Example API call - replace with your actual endpoint
        const response = await fetch('/api/rides/history', {
          headers: {
            'Authorization': `Bearer ${currentUser.token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch rides: ${response.statusText}`);
        }

        const data = await response.json();
        setRides(data);
      } catch (err) {
        console.error('Error fetching ride history:', err);
        setError(`Failed to load ride history: ${err instanceof Error ? err.message : 'Unknown error'}`);
        
        // For demo purposes, set some sample data
        setRides([
          {
            id: '1',
            date: '2025-02-28T14:30:00',
            pickupLocation: '123 Main St, New York, NY',
            dropoffLocation: 'Times Square, New York, NY',
            status: 'COMPLETED',
            price: 25.50,
          },
          {
            id: '2',
            date: '2025-03-01T09:15:00',
            pickupLocation: 'Grand Central, New York, NY',
            dropoffLocation: 'Central Park, New York, NY',
            status: 'SCHEDULED',
            price: 18.75,
          },
          {
            id: '3',
            date: '2025-02-27T19:45:00',
            pickupLocation: 'Brooklyn Bridge, New York, NY',
            dropoffLocation: 'Empire State Building, New York, NY',
            status: 'COMPLETED',
            price: 22.30,
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchRides();
  }, [currentUser, navigate]);

  const getStatusColor = (status: Ride['status']) => {
    switch (status) {
      case 'COMPLETED':
        return 'success';
      case 'CANCELLED':
        return 'error';
      case 'SCHEDULED':
        return 'primary';
      case 'IN_PROGRESS':
        return 'warning';
      default:
        return 'default';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // If user is not authenticated, don't render the component
  if (!currentUser) {
    return null;
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, mb: 6 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h4" component="h1">
            My Dashboard
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<Add />}
            onClick={() => navigate('/book')}
          >
            Book New Ride
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 4 }}>
            {error}
          </Alert>
        )}

        <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
          <Typography variant="h5" gutterBottom>
            My Rides
          </Typography>
          
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
              <CircularProgress />
            </Box>
          ) : rides.length === 0 ? (
            <Box sx={{ textAlign: 'center', my: 4 }}>
              <Typography variant="body1" color="text.secondary" paragraph>
                You haven't taken any rides yet.
              </Typography>
              <Button
                variant="outlined"
                color="primary"
                onClick={() => navigate('/book')}
              >
                Book Your First Ride
              </Button>
            </Box>
          ) : (
            <Grid container spacing={3}>
              {rides.map((ride) => (
                <Grid item xs={12} key={ride.id}>
                  <Card variant="outlined">
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Typography variant="h6" component="div">
                          Ride #{ride.id}
                        </Typography>
                        <Chip
                          label={ride.status}
                          color={getStatusColor(ride.status) as any}
                          size="small"
                        />
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <AccessTime fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          {formatDate(ride.date)}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', mb: 1 }}>
                        <LocationOn fontSize="small" sx={{ mr: 1, mt: 0.5, color: 'text.secondary' }} />
                        <Box>
                          <Typography variant="body2">
                            From: {ride.pickupLocation}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', my: 0.5 }}>
                            <ArrowForward fontSize="small" sx={{ mx: 1, color: 'text.disabled' }} />
                          </Box>
                          <Typography variant="body2">
                            To: {ride.dropoffLocation}
                          </Typography>
                        </Box>
                      </Box>
                      
                      <Typography variant="h6" color="primary" align="right">
                        ${ride.price.toFixed(2)}
                      </Typography>
                    </CardContent>
                    <CardActions>
                      <Button size="small">View Details</Button>
                      {ride.status === 'SCHEDULED' && (
                        <Button size="small" color="error">
                          Cancel Ride
                        </Button>
                      )}
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Paper>
      </Box>
    </Container>
  );
};

export default Dashboard; 