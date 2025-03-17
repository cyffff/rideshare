import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Chip,
  Avatar,
  Divider,
  Button,
  Tab,
  Tabs,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Rating,
  Alert,
  useTheme,
  alpha,
  FormControlLabel,
  Radio
} from '@mui/material';
import {
  DirectionsCar,
  LocationOn,
  AccessTime,
  ArrowForward,
  Receipt,
  Star,
  CreditCard,
  History,
  Pending,
  CheckCircle,
  Cancel
} from '@mui/icons-material';
import GoogleMap from '../components/GoogleMap';
import FreeMap from '../components/FreeMap';
import { format, parseISO } from 'date-fns';
import axios from 'axios';
import locationService from '../services/LocationService';

// Define ride interface
interface Ride {
  id: number;
  pickupLocation: string;
  dropoffLocation: string;
  pickupTime: string;
  status: string;
  price: number;
  driver?: {
    id: number;
    name: string;
    rating: number;
    phoneNumber?: string;
    carModel?: string;
    licensePlate?: string;
  };
  pickupCoordinates: {
    lat: number;
    lng: number;
  };
  dropoffCoordinates: {
    lat: number;
    lng: number;
  };
  distance: number;
  duration: number;
  userRating?: number;
  isShared: boolean;
  otherPassenger?: string;
}

const RideHistory: React.FC = () => {
  const theme = useTheme();
  const [loading, setLoading] = useState<boolean>(true);
  const [rides, setRides] = useState<Ride[]>([]);
  const [activeTab, setActiveTab] = useState<number>(0);
  const [selectedRide, setSelectedRide] = useState<Ride | null>(null);
  const [detailsOpen, setDetailsOpen] = useState<boolean>(false);
  const [ratingOpen, setRatingOpen] = useState<boolean>(false);
  const [ratingValue, setRatingValue] = useState<number>(0);
  const [ratingSubmitting, setRatingSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [mapProvider, setMapProvider] = useState<'google' | 'free'>('free');
  const [routePath, setRoutePath] = useState<{lat: number; lng: number}[]>([]);

  useEffect(() => {
    fetchRides();
  }, []);

  const fetchRides = async () => {
    try {
      setLoading(true);
      // In a real app, fetch from API
      // const response = await axios.get('/api/rides/history');
      // setRides(response.data);
      
      // For demo purposes, use mock data
      setTimeout(() => {
        setRides(getMockRides());
        setLoading(false);
      }, 1000);
    } catch (err) {
      console.error('Error fetching ride history:', err);
      setError('Failed to load your ride history. Please try again.');
      setLoading(false);
    }
  };

  const getMockRides = (): Ride[] => {
    const statuses = ['COMPLETED', 'CANCELLED', 'COMPLETED', 'COMPLETED', 'CANCELLED', 'COMPLETED', 'IN_PROGRESS', 'SCHEDULED'];
    const pickupLocations = ['123 Main St', '456 Elm St', '789 Oak Ave', '101 Pine Rd', '202 Maple Blvd'];
    const dropoffLocations = ['Airport Terminal 1', 'Downtown Mall', 'Central Park', 'Conference Center', 'University Campus'];
    
    return Array(8).fill(null).map((_, index) => {
      const status = statuses[index];
      const isCompleted = status === 'COMPLETED';
      
      // Generate dates from recent to older as we go through the array
      const date = new Date();
      date.setDate(date.getDate() - index);
      
      // San Francisco area coordinates with small variations
      const baseLat = 37.7749;
      const baseLng = -122.4194;
      
      return {
        id: 1000 + index,
        pickupLocation: pickupLocations[index % pickupLocations.length],
        dropoffLocation: dropoffLocations[index % dropoffLocations.length],
        pickupTime: date.toISOString(),
        status,
        price: 10 + Math.random() * 30,
        driver: isCompleted || status === 'IN_PROGRESS' ? {
          id: 100 + index,
          name: ['John Driver', 'Emily Smith', 'Michael Johnson', 'Sarah Williams'][index % 4],
          rating: 3.5 + Math.random() * 1.5,
          phoneNumber: '555-' + Math.floor(Math.random() * 900 + 100) + '-' + Math.floor(Math.random() * 9000 + 1000),
          carModel: ['Toyota Camry', 'Honda Accord', 'Ford Fusion', 'Tesla Model 3'][index % 4],
          licensePlate: 'ABC' + Math.floor(Math.random() * 1000)
        } : undefined,
        pickupCoordinates: {
          lat: baseLat + (Math.random() * 0.05 - 0.025),
          lng: baseLng + (Math.random() * 0.05 - 0.025)
        },
        dropoffCoordinates: {
          lat: baseLat + (Math.random() * 0.05 - 0.025),
          lng: baseLng + (Math.random() * 0.05 - 0.025)
        },
        distance: 2 + Math.random() * 8,
        duration: 10 + Math.random() * 30,
        userRating: isCompleted ? (index % 3 === 0 ? undefined : 4 + Math.random()) : undefined,
        isShared: index % 3 === 0,
        otherPassenger: index % 3 === 0 ? ['Alex', 'Jamie', 'Taylor', 'Jordan'][index % 4] : undefined
      };
    });
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const openRideDetails = (ride: Ride) => {
    setSelectedRide(ride);
    setDetailsOpen(true);
  };

  const closeRideDetails = () => {
    setDetailsOpen(false);
  };

  const openRatingDialog = () => {
    setRatingOpen(true);
    setDetailsOpen(false);
  };

  const closeRatingDialog = () => {
    setRatingOpen(false);
    setRatingValue(0);
  };

  const submitRating = async () => {
    if (!selectedRide || ratingValue === 0) return;
    
    try {
      setRatingSubmitting(true);
      
      // In a real app, call the API
      // await axios.post(`/api/rides/${selectedRide.id}/rate`, {
      //   rating: ratingValue
      // });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update local state
      setRides(prevRides => 
        prevRides.map(ride => 
          ride.id === selectedRide.id 
            ? { ...ride, userRating: ratingValue } 
            : ride
        )
      );
      
      setRatingSubmitting(false);
      setRatingOpen(false);
      
      // Show updated ride details
      setDetailsOpen(true);
    } catch (err) {
      console.error('Error submitting rating:', err);
      setError('Failed to submit rating. Please try again.');
      setRatingSubmitting(false);
    }
  };

  const getStatusChip = (status: string) => {
    let color: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' = 'default';
    let icon: React.ReactNode = null;
    
    switch (status) {
      case 'COMPLETED':
        color = 'success';
        icon = <CheckCircle fontSize="small" />;
        break;
      case 'IN_PROGRESS':
        color = 'primary';
        icon = <DirectionsCar fontSize="small" />;
        break;
      case 'CANCELLED':
        color = 'error';
        icon = <Cancel fontSize="small" />;
        break;
      case 'SCHEDULED':
        color = 'info';
        icon = <Pending fontSize="small" />;
        break;
      default:
        color = 'default';
    }
    
    return (
      <Chip 
        label={status.replace('_', ' ')} 
        color={color} 
        size="small" 
        {...(icon ? { icon } : {})}
        sx={{ fontWeight: 'medium' }}
      />
    );
  };

  const filteredRides = () => {
    if (activeTab === 0) return rides;
    if (activeTab === 1) return rides.filter(ride => ride.status === 'COMPLETED');
    if (activeTab === 2) return rides.filter(ride => ride.status === 'SCHEDULED' || ride.status === 'IN_PROGRESS');
    if (activeTab === 3) return rides.filter(ride => ride.status === 'CANCELLED');
    return rides;
  };

  const loadRouteData = async (ride: Ride) => {
    try {
      const directions = await locationService.getDirections(
        ride.pickupCoordinates,
        ride.dropoffCoordinates
      );
      
      setRoutePath(directions.waypoints);
    } catch (error) {
      console.error("Error loading route data:", error);
      setRoutePath([]);
    }
  };

  useEffect(() => {
    if (selectedRide && detailsOpen) {
      loadRouteData(selectedRide);
    }
  }, [selectedRide, detailsOpen]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1" fontWeight="bold">
          Your Ride History
        </Typography>
        
        <Box>
          <FormControlLabel
            control={
              <Radio
                checked={mapProvider === 'free'}
                onChange={() => setMapProvider('free')}
                size="small"
              />
            }
            label="Free Map"
          />
          <FormControlLabel
            control={
              <Radio
                checked={mapProvider === 'google'}
                onChange={() => setMapProvider('google')}
                size="small"
              />
            }
            label="Google Map"
          />
        </Box>
      </Box>
      
      <Paper elevation={3} sx={{ p: 4, my: 4, borderRadius: 2 }}>
        <Box display="flex" alignItems="center" mb={4}>
          <History sx={{ fontSize: 32, mr: 2, color: theme.palette.primary.main }} />
          <Typography variant="h4" fontWeight="500">
            Ride History
          </Typography>
        </Box>
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs 
            value={activeTab} 
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab label="All Rides" />
            <Tab label="Completed" />
            <Tab label="Upcoming & Active" />
            <Tab label="Cancelled" />
          </Tabs>
        </Box>
        
        {filteredRides().length === 0 ? (
          <Box 
            p={4} 
            textAlign="center"
            sx={{
              backgroundColor: theme.palette.mode === 'light' ? '#f5f5f5' : alpha(theme.palette.primary.main, 0.1),
              borderRadius: 2
            }}
          >
            <Typography variant="h6" color="textSecondary" gutterBottom>
              No rides found
            </Typography>
            <Typography variant="body1" color="textSecondary">
              You don't have any rides in this category yet.
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {filteredRides().map((ride) => (
              <Grid item xs={12} md={6} key={ride.id}>
                <Card 
                  sx={{ 
                    height: '100%',
                    cursor: 'pointer',
                    transition: 'transform 0.2s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: 4
                    },
                    borderRadius: 2,
                    ...(ride.status === 'IN_PROGRESS' ? {
                      borderLeft: `5px solid ${theme.palette.primary.main}`
                    } : {})
                  }}
                  onClick={() => openRideDetails(ride)}
                >
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                      <Typography color="textSecondary" fontSize="0.875rem">
                        {format(parseISO(ride.pickupTime), 'MMM d, yyyy • h:mm a')}
                      </Typography>
                      {getStatusChip(ride.status)}
                    </Box>
                    
                    <Box sx={{ mb: 2 }}>
                      <Box display="flex" alignItems="flex-start" mb={1}>
                        <LocationOn 
                          color="primary" 
                          fontSize="small" 
                          sx={{ mt: 0.5, mr: 1 }} 
                        />
                        <Box>
                          <Typography variant="body2" color="textSecondary">From</Typography>
                          <Typography variant="body1" noWrap>{ride.pickupLocation}</Typography>
                        </Box>
                      </Box>
                      
                      <Box display="flex" justifyContent="center" mx={2} mb={-1}>
                        <ArrowForward color="action" />
                      </Box>
                      
                      <Box display="flex" alignItems="flex-start">
                        <LocationOn 
                          color="error" 
                          fontSize="small" 
                          sx={{ mt: 0.5, mr: 1 }} 
                        />
                        <Box>
                          <Typography variant="body2" color="textSecondary">To</Typography>
                          <Typography variant="body1" noWrap>{ride.dropoffLocation}</Typography>
                        </Box>
                      </Box>
                    </Box>
                    
                    <Divider sx={{ my: 2 }} />
                    
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Box>
                        <Typography variant="h6" color="primary" fontWeight="bold">
                          ${ride.price.toFixed(2)}
                        </Typography>
                        {ride.isShared && (
                          <Chip 
                            label="Shared" 
                            size="small" 
                            color="secondary" 
                            sx={{ mt: 0.5 }} 
                          />
                        )}
                      </Box>
                      
                      <Box display="flex" flexDirection="column" alignItems="flex-end">
                        {ride.userRating ? (
                          <Box display="flex" alignItems="center">
                            <Star sx={{ color: '#FFD700', mr: 0.5 }} />
                            <Typography variant="body2">
                              You rated {ride.userRating.toFixed(1)}
                            </Typography>
                          </Box>
                        ) : ride.status === 'COMPLETED' ? (
                          <Button 
                            size="small" 
                            startIcon={<Star />}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedRide(ride);
                              openRatingDialog();
                            }}
                          >
                            Rate Ride
                          </Button>
                        ) : null}
                        
                        {ride.driver && (
                          <Typography variant="body2" color="textSecondary">
                            Driver: {ride.driver.name}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
        
        {/* Ride Details Dialog */}
        <Dialog
          open={detailsOpen}
          onClose={closeRideDetails}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: { borderRadius: 2 }
          }}
        >
          {selectedRide && (
            <>
              <DialogTitle>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="h5" fontWeight="bold">Ride Details</Typography>
                  {getStatusChip(selectedRide.status)}
                </Box>
              </DialogTitle>
              
              <DialogContent>
                <Box sx={{ height: '250px', mb: 3, borderRadius: 2, overflow: 'hidden' }}>
                  {mapProvider === 'google' ? (
                    <GoogleMap
                      pickupLocation={selectedRide.pickupCoordinates}
                      dropoffLocation={selectedRide.dropoffCoordinates}
                      showDirections={true}
                      height="250px"
                    />
                  ) : (
                    <FreeMap
                      pickupLocation={selectedRide.pickupCoordinates}
                      dropoffLocation={selectedRide.dropoffCoordinates}
                      showDirections={true}
                      height="250px"
                      routePathProp={routePath}
                    />
                  )}
                </Box>
                
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Paper 
                      elevation={0} 
                      sx={{ 
                        p: 2, 
                        backgroundColor: alpha(theme.palette.primary.main, 0.05),
                        borderRadius: 2
                      }}
                    >
                      <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                        Ride Information
                      </Typography>
                      
                      <Box mb={2}>
                        <Typography variant="body2" color="textSecondary">
                          Pickup Time
                        </Typography>
                        <Box display="flex" alignItems="center">
                          <AccessTime fontSize="small" sx={{ mr: 1 }} />
                          <Typography variant="body1" fontWeight="medium">
                            {format(parseISO(selectedRide.pickupTime), 'MMMM d, yyyy • h:mm a')}
                          </Typography>
                        </Box>
                      </Box>
                      
                      <Box mb={2}>
                        <Typography variant="body2" color="textSecondary">
                          Pickup Location
                        </Typography>
                        <Box display="flex" alignItems="flex-start">
                          <LocationOn color="primary" fontSize="small" sx={{ mt: 0.5, mr: 1 }} />
                          <Typography variant="body1" fontWeight="medium">
                            {selectedRide.pickupLocation}
                          </Typography>
                        </Box>
                      </Box>
                      
                      <Box mb={2}>
                        <Typography variant="body2" color="textSecondary">
                          Dropoff Location
                        </Typography>
                        <Box display="flex" alignItems="flex-start">
                          <LocationOn color="error" fontSize="small" sx={{ mt: 0.5, mr: 1 }} />
                          <Typography variant="body1" fontWeight="medium">
                            {selectedRide.dropoffLocation}
                          </Typography>
                        </Box>
                      </Box>
                      
                      <Divider sx={{ my: 2 }} />
                      
                      <Box display="flex" justifyContent="space-between">
                        <Box>
                          <Typography variant="body2" color="textSecondary">
                            Distance
                          </Typography>
                          <Typography variant="body1" fontWeight="medium">
                            {selectedRide.distance.toFixed(1)} miles
                          </Typography>
                        </Box>
                        
                        <Box>
                          <Typography variant="body2" color="textSecondary">
                            Duration
                          </Typography>
                          <Typography variant="body1" fontWeight="medium">
                            {Math.round(selectedRide.duration)} min
                          </Typography>
                        </Box>
                        
                        <Box>
                          <Typography variant="body2" color="textSecondary">
                            Total Price
                          </Typography>
                          <Typography variant="h6" color="primary" fontWeight="bold">
                            ${selectedRide.price.toFixed(2)}
                          </Typography>
                        </Box>
                      </Box>
                      
                      {selectedRide.isShared && selectedRide.otherPassenger && (
                        <Box mt={2}>
                          <Chip 
                            label={`Shared ride with ${selectedRide.otherPassenger}`}
                            color="secondary"
                          />
                        </Box>
                      )}
                    </Paper>
                    
                    {selectedRide.status === 'COMPLETED' && (
                      <Paper 
                        elevation={0} 
                        sx={{ 
                          p: 2, 
                          mt: 2,
                          borderRadius: 2,
                          border: `1px solid ${theme.palette.divider}`
                        }}
                      >
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                          <Box display="flex" alignItems="center">
                            <Receipt sx={{ mr: 1, color: theme.palette.primary.main }} />
                            <Typography variant="subtitle1" fontWeight="bold">
                              Receipt
                            </Typography>
                          </Box>
                          
                          <Button 
                            startIcon={<CreditCard />}
                            variant="outlined"
                            size="small"
                          >
                            View Receipt
                          </Button>
                        </Box>
                      </Paper>
                    )}
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    {selectedRide.driver ? (
                      <Paper 
                        elevation={0}
                        sx={{ 
                          p: 2,
                          borderRadius: 2,
                          border: `1px solid ${theme.palette.divider}`
                        }}
                      >
                        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                          Driver Information
                        </Typography>
                        
                        <Box display="flex" alignItems="center" mb={2}>
                          <Avatar
                            sx={{ width: 60, height: 60, mr: 2 }}
                          >
                            {selectedRide.driver.name.charAt(0)}
                          </Avatar>
                          
                          <Box>
                            <Typography variant="h6">
                              {selectedRide.driver.name}
                            </Typography>
                            
                            <Box display="flex" alignItems="center">
                              <Rating
                                value={selectedRide.driver.rating}
                                precision={0.1}
                                readOnly
                                size="small"
                                sx={{ mr: 0.5 }}
                              />
                              <Typography variant="body2">
                                {selectedRide.driver.rating.toFixed(1)}
                              </Typography>
                            </Box>
                          </Box>
                        </Box>
                        
                        <Divider sx={{ my: 2 }} />
                        
                        <Grid container spacing={2}>
                          <Grid item xs={12} sm={6}>
                            <Typography variant="body2" color="textSecondary">
                              Phone Number
                            </Typography>
                            <Typography variant="body1" fontWeight="medium">
                              {selectedRide.driver.phoneNumber}
                            </Typography>
                          </Grid>
                          
                          <Grid item xs={12} sm={6}>
                            <Typography variant="body2" color="textSecondary">
                              Vehicle
                            </Typography>
                            <Typography variant="body1" fontWeight="medium">
                              {selectedRide.driver.carModel}
                            </Typography>
                          </Grid>
                          
                          <Grid item xs={12} sm={6}>
                            <Typography variant="body2" color="textSecondary">
                              License Plate
                            </Typography>
                            <Typography variant="body1" fontWeight="medium">
                              {selectedRide.driver.licensePlate}
                            </Typography>
                          </Grid>
                        </Grid>
                        
                        <Box mt={3}>
                          {selectedRide.userRating ? (
                            <Box>
                              <Typography variant="body2" color="textSecondary" gutterBottom>
                                Your Rating
                              </Typography>
                              <Box display="flex" alignItems="center">
                                <Rating
                                  value={selectedRide.userRating}
                                  readOnly
                                  sx={{ mr: 1 }}
                                />
                                <Typography variant="body1">
                                  {selectedRide.userRating.toFixed(1)}
                                </Typography>
                              </Box>
                            </Box>
                          ) : selectedRide.status === 'COMPLETED' ? (
                            <Button
                              variant="outlined"
                              startIcon={<Star />}
                              onClick={openRatingDialog}
                              fullWidth
                            >
                              Rate This Ride
                            </Button>
                          ) : null}
                        </Box>
                      </Paper>
                    ) : (
                      <Paper 
                        elevation={0}
                        sx={{ 
                          p: 3,
                          borderRadius: 2,
                          border: `1px solid ${theme.palette.divider}`,
                          textAlign: 'center'
                        }}
                      >
                        <Typography variant="subtitle1" color="textSecondary" paragraph>
                          {selectedRide.status === 'CANCELLED' 
                            ? 'This ride was cancelled' 
                            : 'A driver has not been assigned yet'}
                        </Typography>
                        
                        {selectedRide.status === 'SCHEDULED' && (
                          <Button
                            variant="outlined"
                            color="error"
                            size="small"
                          >
                            Cancel Ride
                          </Button>
                        )}
                      </Paper>
                    )}
                    
                    {selectedRide.status === 'IN_PROGRESS' && (
                      <Paper 
                        elevation={0}
                        sx={{ 
                          p: 2,
                          mt: 2,
                          borderRadius: 2,
                          backgroundColor: alpha(theme.palette.primary.main, 0.05)
                        }}
                      >
                        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                          Live Tracking
                        </Typography>
                        
                        <Box 
                          sx={{ 
                            p: 2, 
                            textAlign: 'center',
                            backgroundColor: alpha(theme.palette.background.paper, 0.8),
                            borderRadius: 1
                          }}
                        >
                          <Typography variant="body1" gutterBottom>
                            Your ride is in progress
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            Track your ride in real-time on the map
                          </Typography>
                        </Box>
                        
                        <Box display="flex" justifyContent="center" mt={2}>
                          <Button
                            variant="contained"
                            color="error"
                            size="small"
                          >
                            Emergency Contact
                          </Button>
                        </Box>
                      </Paper>
                    )}
                    
                    {selectedRide.status === 'SCHEDULED' && (
                      <Paper 
                        elevation={0}
                        sx={{ 
                          p: 2,
                          mt: 2,
                          borderRadius: 2,
                          backgroundColor: alpha(theme.palette.info.main, 0.05)
                        }}
                      >
                        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                          Scheduled Ride Information
                        </Typography>
                        
                        <Box 
                          sx={{ 
                            p: 2, 
                            borderRadius: 1,
                            backgroundColor: alpha(theme.palette.background.paper, 0.8)
                          }}
                        >
                          <Typography variant="body1" gutterBottom>
                            Your ride is scheduled for {format(parseISO(selectedRide.pickupTime), 'MMMM d, yyyy • h:mm a')}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            A driver will be assigned closer to your pickup time
                          </Typography>
                        </Box>
                      </Paper>
                    )}
                  </Grid>
                </Grid>
              </DialogContent>
              
              <DialogActions sx={{ p: 3 }}>
                <Button onClick={closeRideDetails} variant="outlined">
                  Close
                </Button>
                
                {selectedRide.status === 'COMPLETED' && !selectedRide.userRating && (
                  <Button 
                    variant="contained" 
                    startIcon={<Star />}
                    onClick={openRatingDialog}
                  >
                    Rate This Ride
                  </Button>
                )}
              </DialogActions>
            </>
          )}
        </Dialog>
        
        {/* Rating Dialog */}
        <Dialog
          open={ratingOpen}
          onClose={closeRatingDialog}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: { borderRadius: 2 }
          }}
        >
          <DialogTitle>
            <Typography variant="h5" fontWeight="bold">Rate Your Ride</Typography>
          </DialogTitle>
          
          <DialogContent>
            <Box textAlign="center" p={2}>
              <Typography variant="subtitle1" gutterBottom>
                How would you rate your experience?
              </Typography>
              
              <Box py={2}>
                <Rating
                  value={ratingValue}
                  onChange={(event, newValue) => {
                    setRatingValue(newValue || 0);
                  }}
                  size="large"
                  sx={{ fontSize: '3rem' }}
                />
              </Box>
              
              <Typography variant="body1" color="textSecondary">
                Your feedback helps us improve our service
              </Typography>
            </Box>
          </DialogContent>
          
          <DialogActions sx={{ p: 3 }}>
            <Button 
              onClick={closeRatingDialog} 
              variant="outlined"
            >
              Cancel
            </Button>
            <Button
              onClick={submitRating}
              variant="contained"
              disabled={ratingValue === 0 || ratingSubmitting}
            >
              {ratingSubmitting ? <CircularProgress size={24} /> : 'Submit Rating'}
            </Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </Container>
  );
};

export default RideHistory; 