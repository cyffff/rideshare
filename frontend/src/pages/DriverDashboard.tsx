import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Switch,
  FormControlLabel,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Divider,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar,
  IconButton,
  useTheme,
  Tab,
  Tabs
} from '@mui/material';
import { 
  DirectionsCar as CarIcon, 
  AttachMoney as MoneyIcon, 
  Star as StarIcon, 
  Done as DoneIcon, 
  Cancel as CancelIcon, 
  LocationOn as LocationIcon, 
  Timeline as RouteIcon,
  Person as PersonIcon,
  Speed as SpeedIcon,
  AccessTime as TimeIcon
} from '@mui/icons-material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import GoogleMap from '../components/GoogleMap';

// Define RideRequest interface
interface RideRequest {
  id: number;
  pickupLocation: string;
  dropoffLocation: string;
  pickupTime: string;
  estimatedDistance: number;
  estimatedDuration: number;
  price: number;
  status: string;
  passenger: {
    id: number;
    name: string;
    rating: number;
    phoneNumber?: string;
  };
  pickupCoordinates: {
    lat: number;
    lng: number;
  };
  dropoffCoordinates: {
    lat: number;
    lng: number;
  };
  isShared: boolean;
}

// Define Driver interface
interface DriverStats {
  totalRides: number;
  completedRides: number;
  cancelledRides: number;
  totalEarnings: number;
  rating: number;
  acceptanceRate: number;
}

const DriverDashboard: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const [isOnline, setIsOnline] = useState<boolean>(false);
  const [availableRides, setAvailableRides] = useState<RideRequest[]>([]);
  const [activeRide, setActiveRide] = useState<RideRequest | null>(null);
  const [driverStats, setDriverStats] = useState<DriverStats>({
    totalRides: 0,
    completedRides: 0,
    cancelledRides: 0,
    totalEarnings: 0,
    rating: 4.8,
    acceptanceRate: 0.95
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [selectedRide, setSelectedRide] = useState<RideRequest | null>(null);
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<number>(0);

  useEffect(() => {
    fetchDriverData();
    
    // Mock data for demo
    setLoading(false);
  }, []);

  useEffect(() => {
    // If driver is online, start polling for available rides
    let interval: NodeJS.Timeout | null = null;
    
    if (isOnline) {
      fetchAvailableRides();
      interval = setInterval(fetchAvailableRides, 10000); // Poll every 10 seconds
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isOnline]);

  const fetchDriverData = async () => {
    try {
      setLoading(true);
      
      // In a real app, fetch from API
      // const statsResponse = await axios.get('/api/driver/stats');
      // setDriverStats(statsResponse.data);
      
      // For demo, we'll use mock data
      setDriverStats({
        totalRides: 157,
        completedRides: 142,
        cancelledRides: 8,
        totalEarnings: 3245.75,
        rating: 4.8,
        acceptanceRate: 0.95
      });
      
      // Check for active ride
      // const activeRideResponse = await axios.get('/api/driver/active-ride');
      // if (activeRideResponse.data) {
      //   setActiveRide(activeRideResponse.data);
      //   setIsOnline(true);
      // }
      
      // For demo, sometimes show an active ride
      if (Math.random() > 0.5) {
        setActiveRide(getMockRide(true));
        setIsOnline(true);
      }
      
      setError('');
    } catch (error) {
      console.error('Error fetching driver data:', error);
      setError('Failed to load driver data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableRides = async () => {
    if (!isOnline || activeRide) return;
    
    try {
      // In a real app, fetch from API
      // const response = await axios.get('/api/driver/available-rides');
      // setAvailableRides(response.data);
      
      // For demo, use mock data
      const mockRides = Array(Math.floor(Math.random() * 5) + 1)
        .fill(null)
        .map(() => getMockRide());
      
      setAvailableRides(mockRides);
    } catch (error) {
      console.error('Error fetching available rides:', error);
      // Don't set error state here to avoid frequent alerts during polling
    }
  };

  const getMockRide = (isActive = false): RideRequest => {
    const locations = [
      { pickup: "123 Main St", dropoff: "456 Elm St", distance: 3.5, duration: 12, price: 12.50 },
      { pickup: "789 Oak Ave", dropoff: "101 Pine Rd", distance: 5.2, duration: 18, price: 18.75 },
      { pickup: "202 Maple Blvd", dropoff: "303 Cedar Ln", distance: 2.8, duration: 10, price: 10.25 },
      { pickup: "404 Birch St", dropoff: "505 Walnut Ave", distance: 7.1, duration: 25, price: 24.50 },
      { pickup: "606 Cherry Rd", dropoff: "707 Apple St", distance: 4.3, duration: 15, price: 15.75 }
    ];
    
    const randomLocation = locations[Math.floor(Math.random() * locations.length)];
    
    // Generate random coordinates around San Francisco
    const sfLat = 37.7749;
    const sfLng = -122.4194;
    
    return {
      id: Math.floor(Math.random() * 1000) + 1,
      pickupLocation: randomLocation.pickup,
      dropoffLocation: randomLocation.dropoff,
      pickupTime: new Date(Date.now() + (isActive ? 0 : Math.random() * 1000000)).toISOString(),
      estimatedDistance: randomLocation.distance,
      estimatedDuration: randomLocation.duration,
      price: randomLocation.price,
      status: isActive ? "ACCEPTED" : "REQUESTED",
      passenger: {
        id: Math.floor(Math.random() * 100) + 1,
        name: ["John Smith", "Emma Johnson", "Michael Brown", "Sophia Davis", "Robert Wilson"][Math.floor(Math.random() * 5)],
        rating: 3.5 + Math.random() * 1.5,
        phoneNumber: "555-" + Math.floor(Math.random() * 900 + 100) + "-" + Math.floor(Math.random() * 9000 + 1000)
      },
      pickupCoordinates: {
        lat: sfLat + (Math.random() * 0.1 - 0.05),
        lng: sfLng + (Math.random() * 0.1 - 0.05)
      },
      dropoffCoordinates: {
        lat: sfLat + (Math.random() * 0.1 - 0.05),
        lng: sfLng + (Math.random() * 0.1 - 0.05)
      },
      isShared: Math.random() > 0.7
    };
  };

  const toggleDriverStatus = async () => {
    try {
      setActionLoading(true);
      
      // In a real app, call the API
      // await axios.post(`/api/driver/${isOnline ? 'go-offline' : 'go-online'}`);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setIsOnline(!isOnline);
      
      if (!isOnline) {
        // If going online, fetch available rides immediately
        fetchAvailableRides();
      } else {
        // If going offline, clear available rides
        setAvailableRides([]);
      }
      
      setError('');
    } catch (error) {
      console.error('Error toggling driver status:', error);
      setError(`Failed to go ${isOnline ? 'offline' : 'online'}. Please try again.`);
    } finally {
      setActionLoading(false);
    }
  };

  const viewRideDetails = (ride: RideRequest) => {
    setSelectedRide(ride);
    setDialogOpen(true);
  };

  const acceptRide = async (rideId: number) => {
    try {
      setActionLoading(true);
      
      // In a real app, call the API
      // await axios.post(`/api/rides/${rideId}/accept`);
      // const response = await axios.get(`/api/rides/${rideId}`);
      // setActiveRide(response.data);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // For demo, find the ride in available rides and set it as active
      const ride = availableRides.find(r => r.id === rideId);
      if (ride) {
        const updatedRide = { ...ride, status: "ACCEPTED" };
        setActiveRide(updatedRide);
      }
      
      // Clear available rides as driver is now busy
      setAvailableRides([]);
      setDialogOpen(false);
      setError('');
    } catch (error) {
      console.error('Error accepting ride:', error);
      setError('Failed to accept ride. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const startRide = async () => {
    if (!activeRide) return;
    
    try {
      setActionLoading(true);
      
      // In a real app, call the API
      // await axios.post(`/api/rides/${activeRide.id}/start`);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update the active ride status
      setActiveRide({
        ...activeRide,
        status: 'IN_PROGRESS'
      });
      
      setError('');
    } catch (error) {
      console.error('Error starting ride:', error);
      setError('Failed to start ride. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const completeRide = async () => {
    if (!activeRide) return;
    
    try {
      setActionLoading(true);
      
      // In a real app, call the API
      // await axios.post(`/api/rides/${activeRide.id}/complete`);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Clear active ride as it's now completed
      setActiveRide(null);
      
      // Update driver stats
      setDriverStats({
        ...driverStats,
        totalRides: driverStats.totalRides + 1,
        completedRides: driverStats.completedRides + 1,
        totalEarnings: driverStats.totalEarnings + (activeRide.price || 0)
      });
      
      setError('');
    } catch (error) {
      console.error('Error completing ride:', error);
      setError('Failed to complete ride. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const cancelRide = async () => {
    if (!activeRide) return;
    
    try {
      setActionLoading(true);
      
      // In a real app, call the API
      // await axios.post(`/api/rides/${activeRide.id}/cancel-by-driver`);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Clear active ride as it's now cancelled
      setActiveRide(null);
      
      // Update driver stats
      setDriverStats({
        ...driverStats,
        cancelledRides: driverStats.cancelledRides + 1
      });
      
      setError('');
    } catch (error) {
      console.error('Error cancelling ride:', error);
      setError('Failed to cancel ride. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg">
      <Paper elevation={3} sx={{ p: 4, my: 4, borderRadius: 2 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
          <Box display="flex" alignItems="center">
            <Avatar sx={{ bgcolor: theme.palette.primary.main, mr: 2, width: 56, height: 56 }}>
              <CarIcon fontSize="large" />
            </Avatar>
            <Typography variant="h4" fontWeight="500">Driver Dashboard</Typography>
          </Box>
          
          <FormControlLabel
            control={
              <Switch
                checked={isOnline}
                onChange={toggleDriverStatus}
                disabled={actionLoading}
                color={isOnline ? "success" : "default"}
              />
            }
            label={
              <Typography 
                variant="h6" 
                color={isOnline ? "success.main" : "text.secondary"}
                fontWeight={isOnline ? "bold" : "normal"}
              >
                {isOnline ? "Online" : "Offline"}
              </Typography>
            }
          />
        </Box>
        
        {error && (
          <Alert severity="error" sx={{ mb: 4 }}>
            {error}
          </Alert>
        )}
        
        <Box mb={4}>
          <Typography variant="h5" fontWeight="500" gutterBottom>
            Your Stats
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={6} sm={4} md={2}>
              <Paper 
                elevation={2} 
                sx={{ 
                  p: 2, 
                  textAlign: 'center', 
                  height: '100%',
                  backgroundColor: theme.palette.mode === 'light' ? '#fff' : theme.palette.background.paper,
                  borderRadius: 2,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: 6
                  }
                }}
              >
                <CarIcon color="primary" fontSize="large" />
                <Typography variant="h5" fontWeight="bold">{driverStats.totalRides}</Typography>
                <Typography variant="body2" color="textSecondary">Total Rides</Typography>
              </Paper>
            </Grid>
            
            <Grid item xs={6} sm={4} md={2}>
              <Paper 
                elevation={2} 
                sx={{ 
                  p: 2, 
                  textAlign: 'center', 
                  height: '100%',
                  backgroundColor: theme.palette.mode === 'light' ? '#fff' : theme.palette.background.paper,
                  borderRadius: 2,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: 6
                  }
                }}
              >
                <StarIcon sx={{ color: '#FFD700' }} fontSize="large" />
                <Typography variant="h5" fontWeight="bold">{driverStats.rating.toFixed(1)}</Typography>
                <Typography variant="body2" color="textSecondary">Rating</Typography>
              </Paper>
            </Grid>
            
            <Grid item xs={6} sm={4} md={2}>
              <Paper 
                elevation={2} 
                sx={{ 
                  p: 2, 
                  textAlign: 'center', 
                  height: '100%',
                  backgroundColor: theme.palette.mode === 'light' ? '#fff' : theme.palette.background.paper,
                  borderRadius: 2,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: 6
                  }
                }}
              >
                <MoneyIcon color="primary" fontSize="large" />
                <Typography variant="h5" fontWeight="bold">${driverStats.totalEarnings.toFixed(2)}</Typography>
                <Typography variant="body2" color="textSecondary">Earnings</Typography>
              </Paper>
            </Grid>
            
            <Grid item xs={6} sm={4} md={2}>
              <Paper 
                elevation={2} 
                sx={{ 
                  p: 2, 
                  textAlign: 'center', 
                  height: '100%',
                  backgroundColor: theme.palette.mode === 'light' ? '#fff' : theme.palette.background.paper,
                  borderRadius: 2,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: 6
                  }
                }}
              >
                <DoneIcon color="success" fontSize="large" />
                <Typography variant="h5" fontWeight="bold">{driverStats.completedRides}</Typography>
                <Typography variant="body2" color="textSecondary">Completed</Typography>
              </Paper>
            </Grid>
            
            <Grid item xs={6} sm={4} md={2}>
              <Paper 
                elevation={2} 
                sx={{ 
                  p: 2, 
                  textAlign: 'center', 
                  height: '100%',
                  backgroundColor: theme.palette.mode === 'light' ? '#fff' : theme.palette.background.paper,
                  borderRadius: 2,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: 6
                  }
                }}
              >
                <CancelIcon color="error" fontSize="large" />
                <Typography variant="h5" fontWeight="bold">{driverStats.cancelledRides}</Typography>
                <Typography variant="body2" color="textSecondary">Cancelled</Typography>
              </Paper>
            </Grid>
            
            <Grid item xs={6} sm={4} md={2}>
              <Paper 
                elevation={2} 
                sx={{ 
                  p: 2, 
                  textAlign: 'center', 
                  height: '100%',
                  backgroundColor: theme.palette.mode === 'light' ? '#fff' : theme.palette.background.paper,
                  borderRadius: 2,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: 6
                  }
                }}
              >
                <SpeedIcon color="info" fontSize="large" />
                <Typography variant="h5" fontWeight="bold">{(driverStats.acceptanceRate * 100).toFixed(0)}%</Typography>
                <Typography variant="body2" color="textSecondary">Acceptance</Typography>
              </Paper>
            </Grid>
          </Grid>
        </Box>
        
        {activeRide && (
          <Box mb={4}>
            <Typography variant="h5" fontWeight="500" gutterBottom>
              Active Ride
            </Typography>
            <Card elevation={3} sx={{ 
              borderRadius: 2,
              overflow: 'hidden',
              boxShadow: '0 8px 24px rgba(0,0,0,0.12)'
            }}>
              <Box sx={{ height: '200px', position: 'relative' }}>
                <GoogleMap
                  pickupLocation={activeRide.pickupCoordinates}
                  dropoffLocation={activeRide.dropoffCoordinates}
                  showDirections={true}
                  height="200px"
                />
              </Box>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h6" fontWeight="500">
                    Current Trip
                  </Typography>
                  <Chip 
                    label={activeRide.status} 
                    color={
                      activeRide.status === 'ACCEPTED' ? 'primary' :
                      activeRide.status === 'IN_PROGRESS' ? 'secondary' : 'default'
                    } 
                    size="medium"
                    sx={{ fontWeight: 'bold' }}
                  />
                </Box>
                
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Box display="flex" alignItems="flex-start" mb={1}>
                      <LocationIcon color="primary" fontSize="small" sx={{ mt: 0.5, mr: 1 }} />
                      <Box>
                        <Typography variant="body2" color="textSecondary">Pickup</Typography>
                        <Typography variant="body1" fontWeight="medium">{activeRide.pickupLocation}</Typography>
                      </Box>
                    </Box>
                    
                    <Box display="flex" alignItems="flex-start" mb={1}>
                      <LocationIcon color="error" fontSize="small" sx={{ mt: 0.5, mr: 1 }} />
                      <Box>
                        <Typography variant="body2" color="textSecondary">Dropoff</Typography>
                        <Typography variant="body1" fontWeight="medium">{activeRide.dropoffLocation}</Typography>
                      </Box>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Box display="flex" alignItems="center" mb={1}>
                      <PersonIcon fontSize="small" sx={{ mr: 1 }} />
                      <Box>
                        <Typography variant="body2" color="textSecondary">Passenger</Typography>
                        <Box display="flex" alignItems="center">
                          <Typography variant="body1" fontWeight="medium" sx={{ mr: 1 }}>
                            {activeRide.passenger.name}
                          </Typography>
                          <Chip
                            size="small"
                            icon={<StarIcon sx={{ fontSize: '0.8rem !important', color: '#FFD700 !important' }} />}
                            label={activeRide.passenger.rating.toFixed(1)}
                            sx={{ 
                              height: 20, 
                              '& .MuiChip-label': { 
                                px: 1, 
                                fontSize: '0.7rem', 
                                fontWeight: 'bold' 
                              } 
                            }}
                          />
                        </Box>
                      </Box>
                    </Box>
                    
                    {activeRide.passenger.phoneNumber && (
                      <Box display="flex" alignItems="center" mb={1}>
                        <Typography variant="body2" sx={{ mr: 1 }}>
                          <strong>Phone:</strong>
                        </Typography>
                        <Typography variant="body2">
                          {activeRide.passenger.phoneNumber}
                        </Typography>
                      </Box>
                    )}
                    
                    <Box display="flex" justifyContent="space-between" mt={2}>
                      <Box>
                        <Typography variant="body2" color="textSecondary">Price</Typography>
                        <Typography variant="h6" color="primary" fontWeight="bold">
                          ${activeRide.price.toFixed(2)}
                        </Typography>
                      </Box>
                      
                      <Box>
                        <Typography variant="body2" color="textSecondary">Distance</Typography>
                        <Typography variant="body1" fontWeight="medium">
                          {activeRide.estimatedDistance.toFixed(1)} miles
                        </Typography>
                      </Box>
                      
                      <Box>
                        <Typography variant="body2" color="textSecondary">Time</Typography>
                        <Typography variant="body1" fontWeight="medium">
                          {activeRide.estimatedDuration} min
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
              
              <Divider />
              
              <CardActions sx={{ justifyContent: 'flex-end', p: 2 }}>
                {activeRide.status === 'ACCEPTED' && (
                  <Button 
                    variant="contained" 
                    color="primary"
                    size="large"
                    startIcon={<RouteIcon />}
                    onClick={startRide}
                    disabled={actionLoading}
                    sx={{ px: 3 }}
                  >
                    {actionLoading ? <CircularProgress size={24} /> : 'Start Ride'}
                  </Button>
                )}
                
                {activeRide.status === 'IN_PROGRESS' && (
                  <Button 
                    variant="contained" 
                    color="success"
                    size="large"
                    startIcon={<DoneIcon />}
                    onClick={completeRide}
                    disabled={actionLoading}
                    sx={{ px: 3 }}
                  >
                    {actionLoading ? <CircularProgress size={24} /> : 'Complete Ride'}
                  </Button>
                )}
                
                {['ACCEPTED', 'IN_PROGRESS'].includes(activeRide.status) && (
                  <Button 
                    variant="outlined" 
                    color="error"
                    size="large"
                    startIcon={<CancelIcon />}
                    onClick={cancelRide}
                    disabled={actionLoading}
                    sx={{ ml: 2 }}
                  >
                    Cancel Ride
                  </Button>
                )}
              </CardActions>
            </Card>
          </Box>
        )}
        
        <Box>
          <Typography variant="h5" fontWeight="500" gutterBottom>
            Available Rides
          </Typography>
          
          {!isOnline ? (
            <Alert severity="info" sx={{ mb: 2 }}>
              Go online to see available ride requests
            </Alert>
          ) : activeRide ? (
            <Alert severity="warning" sx={{ mb: 2 }}>
              You have an active ride in progress. Complete it before accepting new rides.
            </Alert>
          ) : availableRides.length === 0 ? (
            <Alert severity="info" sx={{ mb: 2 }}>
              No available ride requests at the moment. Please wait for new requests.
            </Alert>
          ) : (
            <>
              <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
                <Tabs value={activeTab} onChange={handleTabChange}>
                  <Tab label="All Rides" />
                  <Tab label="Nearby" />
                  {/* We could add more filtering options here */}
                </Tabs>
              </Box>
              
              <Grid container spacing={2}>
                {availableRides.map(ride => (
                  <Grid item xs={12} sm={6} md={4} key={ride.id}>
                    <Card sx={{ 
                      height: '100%', 
                      display: 'flex', 
                      flexDirection: 'column',
                      borderRadius: 2,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-5px)',
                        boxShadow: 6
                      }
                    }}>
                      <CardContent sx={{ flexGrow: 1 }}>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                          <Typography variant="h6" color="primary" fontWeight="bold">
                            ${ride.price.toFixed(2)}
                          </Typography>
                          {ride.isShared && (
                            <Chip label="Shared" color="secondary" size="small" />
                          )}
                        </Box>
                        
                        <Box display="flex" alignItems="flex-start" mb={1}>
                          <LocationIcon color="primary" fontSize="small" sx={{ mt: 0.5, mr: 1 }} />
                          <Typography variant="body2" noWrap>{ride.pickupLocation}</Typography>
                        </Box>
                        
                        <Box display="flex" alignItems="flex-start" mb={1}>
                          <LocationIcon color="error" fontSize="small" sx={{ mt: 0.5, mr: 1 }} />
                          <Typography variant="body2" noWrap>{ride.dropoffLocation}</Typography>
                        </Box>
                        
                        <Box display="flex" alignItems="center" mb={1}>
                          <PersonIcon fontSize="small" sx={{ mr: 1 }} />
                          <Typography variant="body2" noWrap>
                            {ride.passenger.name} ({ride.passenger.rating.toFixed(1)} ⭐)
                          </Typography>
                        </Box>
                        
                        <Divider sx={{ my: 1 }} />
                        
                        <Box display="flex" justifyContent="space-between">
                          <Box display="flex" alignItems="center">
                            <RouteIcon fontSize="small" sx={{ mr: 0.5 }} />
                            <Typography variant="body2">
                              {ride.estimatedDistance.toFixed(1)} mi
                            </Typography>
                          </Box>
                          
                          <Box display="flex" alignItems="center">
                            <TimeIcon fontSize="small" sx={{ mr: 0.5 }} />
                            <Typography variant="body2">
                              {ride.estimatedDuration} min
                            </Typography>
                          </Box>
                        </Box>
                      </CardContent>
                      
                      <CardActions sx={{ justifyContent: 'space-between', p: 2 }}>
                        <Button 
                          size="small" 
                          onClick={() => viewRideDetails(ride)}
                        >
                          View Details
                        </Button>
                        
                        <Button 
                          size="small"
                          variant="contained" 
                          color="primary"
                          onClick={() => acceptRide(ride.id)}
                          disabled={actionLoading}
                        >
                          Accept
                        </Button>
                      </CardActions>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </>
          )}
        </Box>
        
        <Dialog 
          open={dialogOpen} 
          onClose={() => setDialogOpen(false)} 
          maxWidth="md"
          fullWidth
          PaperProps={{
            elevation: 5,
            sx: { borderRadius: 2 }
          }}
        >
          {selectedRide && (
            <>
              <DialogTitle sx={{ pb: 0 }}>
                <Typography variant="h5" fontWeight="bold">Ride Details</Typography>
              </DialogTitle>
              
              <DialogContent>
                <Box sx={{ height: '300px', mt: 2, mb: 3, borderRadius: 2, overflow: 'hidden' }}>
                  <GoogleMap
                    pickupLocation={selectedRide.pickupCoordinates}
                    dropoffLocation={selectedRide.dropoffCoordinates}
                    showDirections={true}
                    height="300px"
                  />
                </Box>
                
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <Box mb={2}>
                      <Typography variant="subtitle2" color="textSecondary">Pickup Location</Typography>
                      <Typography variant="subtitle1" fontWeight="medium">{selectedRide.pickupLocation}</Typography>
                    </Box>
                    
                    <Box mb={2}>
                      <Typography variant="subtitle2" color="textSecondary">Dropoff Location</Typography>
                      <Typography variant="subtitle1" fontWeight="medium">{selectedRide.dropoffLocation}</Typography>
                    </Box>
                    
                    <Box display="flex" mb={2}>
                      <Box mr={4}>
                        <Typography variant="subtitle2" color="textSecondary">Distance</Typography>
                        <Typography variant="subtitle1" fontWeight="medium">{selectedRide.estimatedDistance.toFixed(1)} miles</Typography>
                      </Box>
                      
                      <Box>
                        <Typography variant="subtitle2" color="textSecondary">Duration</Typography>
                        <Typography variant="subtitle1" fontWeight="medium">{selectedRide.estimatedDuration} minutes</Typography>
                      </Box>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Box mb={2}>
                      <Typography variant="subtitle2" color="textSecondary">Passenger</Typography>
                      <Box display="flex" alignItems="center">
                        <Avatar sx={{ mr: 1, width: 32, height: 32, bgcolor: theme.palette.primary.main }}>
                          {selectedRide.passenger.name.charAt(0)}
                        </Avatar>
                        <Typography variant="subtitle1" fontWeight="medium">{selectedRide.passenger.name}</Typography>
                      </Box>
                    </Box>
                    
                    <Box mb={2}>
                      <Typography variant="subtitle2" color="textSecondary">Rating</Typography>
                      <Box display="flex" alignItems="center">
                        <Typography variant="subtitle1" fontWeight="medium">{selectedRide.passenger.rating.toFixed(1)}</Typography>
                        <StarIcon sx={{ ml: 0.5, color: '#FFD700' }} />
                      </Box>
                    </Box>
                    
                    <Box mb={2}>
                      <Typography variant="subtitle2" color="textSecondary">Price</Typography>
                      <Typography variant="h5" color="primary" fontWeight="bold">${selectedRide.price.toFixed(2)}</Typography>
                    </Box>
                    
                    {selectedRide.isShared && (
                      <Box mb={2}>
                        <Chip 
                          label="Shared Ride" 
                          color="secondary" 
                          icon={<PersonIcon />} 
                          sx={{ fontWeight: 'medium' }}
                        />
                      </Box>
                    )}
                  </Grid>
                </Grid>
              </DialogContent>
              
              <DialogActions sx={{ p: 3 }}>
                <Button 
                  onClick={() => setDialogOpen(false)} 
                  variant="outlined"
                >
                  Close
                </Button>
                <Button 
                  variant="contained" 
                  color="primary"
                  onClick={() => acceptRide(selectedRide.id)}
                  disabled={actionLoading}
                  startIcon={actionLoading ? <CircularProgress size={20} /> : <DoneIcon />}
                >
                  Accept Ride
                </Button>
              </DialogActions>
            </>
          )}
        </Dialog>
      </Paper>
    </Container>
  );
};

export default DriverDashboard; 