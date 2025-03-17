import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  TextField,
  Button,
  InputAdornment,
  Divider,
  Stepper,
  Step,
  StepLabel,
  Alert,
  CircularProgress,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  Chip,
  Card,
  CardContent,
  useTheme,
  alpha,
  Dialog,
  DialogContent,
  DialogActions,
  DialogTitle,
  Rating,
  Avatar
} from '@mui/material';
import {
  LocationOn,
  MyLocation,
  Schedule,
  DirectionsCar,
  AccessTime,
  CreditCard,
  Person,
  CheckCircle,
  Timer,
  Groups,
  LocalTaxi,
  Star
} from '@mui/icons-material';
import GoogleMap from '../components/GoogleMap';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DateTimePicker } from '@mui/x-date-pickers';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { format, addMinutes } from 'date-fns';

// Define interface for location data
interface Location {
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

// Define available ride types
interface RideType {
  id: string;
  name: string;
  description: string;
  capacity: number;
  icon: React.ReactNode;
  multiplier: number;
  estimatedWait: string;
}

const rideTypes: RideType[] = [
  {
    id: 'economy',
    name: 'Economy',
    description: 'Affordable ride for everyday use',
    capacity: 4,
    icon: <LocalTaxi fontSize="large" />,
    multiplier: 1.0,
    estimatedWait: '3-5 min'
  },
  {
    id: 'comfort',
    name: 'Comfort',
    description: 'Newer cars with extra legroom',
    capacity: 4,
    icon: <DirectionsCar fontSize="large" />,
    multiplier: 1.3,
    estimatedWait: '5-8 min'
  },
  {
    id: 'shared',
    name: 'Shared',
    description: 'Share your ride and save',
    capacity: 2,
    icon: <Groups fontSize="large" />,
    multiplier: 0.7,
    estimatedWait: '5-10 min'
  }
];

// Steps for the booking process
const steps = ['Location', 'Ride Type', 'Payment'];

const BookRide: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  
  // State for booking flow
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  
  // State for location
  const [pickupLocation, setPickupLocation] = useState<Location | null>(null);
  const [dropoffLocation, setDropoffLocation] = useState<Location | null>(null);
  const [currentUserLocation, setCurrentUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  
  // State for ride details
  const [selectedRideType, setSelectedRideType] = useState<string>(rideTypes[0].id);
  const [isScheduled, setIsScheduled] = useState<boolean>(false);
  const [scheduledTime, setScheduledTime] = useState<Date | null>(new Date());
  const [estimatedDistance, setEstimatedDistance] = useState<number>(0);
  const [estimatedDuration, setEstimatedDuration] = useState<number>(0);
  const [estimatedPrice, setEstimatedPrice] = useState<number>(0);
  const [numberOfPassengers, setNumberOfPassengers] = useState<number>(1);
  const [notes, setNotes] = useState<string>('');
  
  // Get current user location on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          
          // For demo purposes, also set a default pickup location
          const defaultPickup = {
            address: '123 Main St, San Francisco, CA',
            coordinates: {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            }
          };
          setPickupLocation(defaultPickup);
        },
        (error) => {
          console.error("Error getting user location", error);
          
          // Set default locations for demo
          const defaultLocation = {
            lat: 37.7749,
            lng: -122.4194 // San Francisco coordinates
          };
          setCurrentUserLocation(defaultLocation);
          
          const defaultPickup = {
            address: '123 Main St, San Francisco, CA',
            coordinates: defaultLocation
          };
          setPickupLocation(defaultPickup);
        }
      );
    }
  }, []);
  
  // Mock function to simulate address lookup
  const searchAddress = (query: string, isPickup: boolean) => {
    // In a real app, this would call a geocoding service
    setTimeout(() => {
      // Generate random coordinates near San Francisco
      const baseLat = 37.7749;
      const baseLng = -122.4194;
      
      const location = {
        address: query,
        coordinates: {
          lat: baseLat + (Math.random() * 0.02 - 0.01),
          lng: baseLng + (Math.random() * 0.02 - 0.01)
        }
      };
      
      if (isPickup) {
        setPickupLocation(location);
      } else {
        setDropoffLocation(location);
      }
      
      // If both locations are set, calculate estimated price
      if ((isPickup && dropoffLocation) || (!isPickup && pickupLocation)) {
        calculateEstimates();
      }
    }, 500);
  };
  
  const calculateEstimates = useCallback(() => {
    if (!pickupLocation || !dropoffLocation) return;
    
    // In a real app, this would use the Google Maps Distance Matrix API
    // For demo, generate reasonable values
    const distance = 3 + Math.random() * 5; // 3-8 miles
    const duration = 10 + Math.random() * 20; // 10-30 minutes
    
    setEstimatedDistance(distance);
    setEstimatedDuration(duration);
    
    // Base price calculation (in a real app, would be more sophisticated)
    const basePrice = 2.5 + (distance * 1.5) + (duration * 0.2);
    const selectedRide = rideTypes.find(ride => ride.id === selectedRideType);
    if (selectedRide) {
      setEstimatedPrice(basePrice * selectedRide.multiplier);
    } else {
      setEstimatedPrice(basePrice);
    }
  }, [pickupLocation, dropoffLocation, selectedRideType]);
  
  // Recalculate when ride type changes
  useEffect(() => {
    if (pickupLocation && dropoffLocation) {
      calculateEstimates();
    }
  }, [selectedRideType, calculateEstimates]);
  
  const handleRouteCalculated = (distance: number, duration: number) => {
    setEstimatedDistance(distance);
    setEstimatedDuration(duration);
    
    // Base price calculation
    const basePrice = 2.5 + (distance * 1.5) + (duration * 0.2);
    const selectedRide = rideTypes.find(ride => ride.id === selectedRideType);
    if (selectedRide) {
      setEstimatedPrice(basePrice * selectedRide.multiplier);
    } else {
      setEstimatedPrice(basePrice);
    }
  };
  
  const handleNext = () => {
    if (activeStep === 0 && (!pickupLocation || !dropoffLocation)) {
      setError("Please select both pickup and dropoff locations");
      return;
    }
    
    if (activeStep === steps.length - 1) {
      handleBookRide();
    } else {
      setActiveStep((prevStep) => prevStep + 1);
      setError(null);
    }
  };
  
  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
    setError(null);
  };
  
  const handleBookRide = async () => {
    if (!pickupLocation || !dropoffLocation) {
      setError("Please select both pickup and dropoff locations");
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // In a real app, this would make an API call to create a ride
      // const response = await axios.post('/api/rides', {
      //   pickupLocation: pickupLocation.coordinates,
      //   pickupAddress: pickupLocation.address,
      //   dropoffLocation: dropoffLocation.coordinates,
      //   dropoffAddress: dropoffLocation.address,
      //   rideType: selectedRideType,
      //   isScheduled,
      //   scheduledTime: isScheduled ? scheduledTime : null,
      //   estimatedPrice,
      //   estimatedDistance,
      //   estimatedDuration,
      //   numberOfPassengers,
      //   notes
      // });
      
      // Simulate API call delay for demo
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Show success dialog
      setShowSuccessDialog(true);
      
      // Reset form state (in a real app, might redirect to a ride tracking page)
      setTimeout(() => {
        setLoading(false);
      }, 500);
    } catch (err) {
      console.error("Error booking ride:", err);
      setError("Failed to book your ride. Please try again.");
      setLoading(false);
    }
  };
  
  const handleSetCurrentLocationAsPickup = () => {
    if (currentUserLocation) {
      const location = {
        address: 'Current Location',
        coordinates: currentUserLocation
      };
      setPickupLocation(location);
      
      if (dropoffLocation) {
        calculateEstimates();
      }
    }
  };
  
  const handleSuccessDialogClose = () => {
    setShowSuccessDialog(false);
    // In a real app, you might navigate to a ride tracking page
    navigate('/ride-history');
  };
  
  // Render the location selection step
  const renderLocationStep = () => (
    <Box>
      <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 2, border: `1px solid ${theme.palette.divider}` }}>
        <Typography variant="h6" gutterBottom>
          Select Pickup & Dropoff
        </Typography>
        
        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            label="Pickup Location"
            variant="outlined"
            value={pickupLocation?.address || ''}
            onChange={(e) => searchAddress(e.target.value, true)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LocationOn color="primary" />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <Button 
                    size="small" 
                    startIcon={<MyLocation />}
                    onClick={handleSetCurrentLocationAsPickup}
                  >
                    Current
                  </Button>
                </InputAdornment>
              )
            }}
            sx={{ mb: 2 }}
          />
          
          <TextField
            fullWidth
            label="Dropoff Location"
            variant="outlined"
            value={dropoffLocation?.address || ''}
            onChange={(e) => searchAddress(e.target.value, false)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LocationOn color="error" />
                </InputAdornment>
              )
            }}
          />
        </Box>
        
        <FormControlLabel
          control={
            <Radio
              checked={!isScheduled}
              onChange={() => setIsScheduled(false)}
            />
          }
          label="Ride now"
        />
        
        <FormControlLabel
          control={
            <Radio
              checked={isScheduled}
              onChange={() => setIsScheduled(true)}
            />
          }
          label="Schedule for later"
        />
        
        {isScheduled && (
          <Box sx={{ mt: 2 }}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DateTimePicker
                label="Pickup Time"
                value={scheduledTime}
                onChange={(newValue) => setScheduledTime(newValue)}
                minDateTime={new Date()}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    variant: 'outlined',
                    InputProps: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <Schedule />
                        </InputAdornment>
                      )
                    }
                  }
                }}
              />
            </LocalizationProvider>
          </Box>
        )}
      </Paper>
      
      <Paper elevation={0} sx={{ 
        p: 2, 
        borderRadius: 2, 
        border: `1px solid ${theme.palette.divider}`,
        height: '300px', 
        overflow: 'hidden'
      }}>
        <GoogleMap
          pickupLocation={pickupLocation?.coordinates}
          dropoffLocation={dropoffLocation?.coordinates}
          currentLocation={currentUserLocation || undefined}
          showDirections={!!(pickupLocation && dropoffLocation)}
          height="100%"
          onRouteCalculated={handleRouteCalculated}
        />
      </Paper>
      
      {pickupLocation && dropoffLocation && (
        <Paper 
          elevation={0} 
          sx={{ 
            mt: 3, 
            p: 2, 
            borderRadius: 2, 
            border: `1px solid ${theme.palette.divider}`,
            backgroundColor: alpha(theme.palette.primary.main, 0.05)
          }}
        >
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="body2" color="textSecondary">
                Estimated Distance
              </Typography>
              <Box display="flex" alignItems="center">
                <DirectionsCar sx={{ mr: 1, color: theme.palette.primary.main }} />
                <Typography variant="h6" color="primary.main">
                  {estimatedDistance.toFixed(1)} miles
                </Typography>
              </Box>
            </Box>
            
            <Box>
              <Typography variant="body2" color="textSecondary">
                Estimated Duration
              </Typography>
              <Box display="flex" alignItems="center">
                <AccessTime sx={{ mr: 1, color: theme.palette.primary.main }} />
                <Typography variant="h6" color="primary.main">
                  {Math.round(estimatedDuration)} min
                </Typography>
              </Box>
            </Box>
            
            <Box>
              <Typography variant="body2" color="textSecondary">
                Estimated Price
              </Typography>
              <Box display="flex" alignItems="center">
                <CreditCard sx={{ mr: 1, color: theme.palette.primary.main }} />
                <Typography variant="h6" color="primary.main">
                  ${estimatedPrice.toFixed(2)}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Paper>
      )}
    </Box>
  );
  
  // Render the ride type selection step
  const renderRideTypeStep = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        Select Ride Type
      </Typography>
      
      <Grid container spacing={2}>
        {rideTypes.map((ride) => (
          <Grid item xs={12} sm={4} key={ride.id}>
            <Card 
              onClick={() => setSelectedRideType(ride.id)}
              sx={{ 
                cursor: 'pointer',
                height: '100%',
                border: ride.id === selectedRideType 
                  ? `2px solid ${theme.palette.primary.main}` 
                  : `1px solid ${theme.palette.divider}`,
                borderRadius: 2,
                transition: 'all 0.3s ease',
                transform: ride.id === selectedRideType ? 'translateY(-5px)' : 'none',
                boxShadow: ride.id === selectedRideType ? 3 : 0,
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: 3
                }
              }}
            >
              <CardContent>
                <Box 
                  display="flex" 
                  alignItems="center" 
                  mb={1}
                  color={ride.id === selectedRideType ? 'primary.main' : 'text.primary'}
                >
                  <Box mr={1}>
                    {ride.icon}
                  </Box>
                  <Typography variant="h6" fontWeight="bold">
                    {ride.name}
                  </Typography>
                </Box>
                
                <Typography variant="body2" sx={{ mb: 2 }}>
                  {ride.description}
                </Typography>
                
                <Divider sx={{ mb: 2 }} />
                
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box display="flex" alignItems="center">
                    <Person fontSize="small" sx={{ mr: 0.5 }} />
                    <Typography variant="body2">
                      Up to {ride.capacity}
                    </Typography>
                  </Box>
                  
                  <Box display="flex" alignItems="center">
                    <Timer fontSize="small" sx={{ mr: 0.5 }} />
                    <Typography variant="body2">
                      {ride.estimatedWait}
                    </Typography>
                  </Box>
                </Box>
                
                <Box mt={2}>
                  <Typography variant="h6" color="primary" fontWeight="bold">
                    ${(estimatedPrice * ride.multiplier).toFixed(2)}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      
      <Paper elevation={0} sx={{ mt: 3, p: 3, borderRadius: 2, border: `1px solid ${theme.palette.divider}` }}>
        <Typography variant="subtitle1" gutterBottom>
          Ride Details
        </Typography>
        
        <Box sx={{ mt: 2 }}>
          <TextField
            fullWidth
            label="Number of Passengers"
            type="number"
            variant="outlined"
            value={numberOfPassengers}
            onChange={(e) => setNumberOfPassengers(Math.min(Math.max(1, parseInt(e.target.value)), 4))}
            inputProps={{ min: 1, max: 4 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Person />
                </InputAdornment>
              )
            }}
            sx={{ mb: 2 }}
          />
          
          <TextField
            fullWidth
            label="Notes for Driver (Optional)"
            variant="outlined"
            multiline
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Special instructions, luggage information, etc."
          />
        </Box>
      </Paper>
    </Box>
  );
  
  // Render the payment and confirmation step
  const renderPaymentStep = () => (
    <Box>
      <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 2, border: `1px solid ${theme.palette.divider}` }}>
        <Typography variant="h6" gutterBottom>
          Ride Summary
        </Typography>
        
        <Box sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Box mb={2}>
                <Typography variant="body2" color="textSecondary">
                  Pickup
                </Typography>
                <Box display="flex" alignItems="flex-start">
                  <LocationOn 
                    color="primary" 
                    fontSize="small" 
                    sx={{ mt: 0.5, mr: 1 }} 
                  />
                  <Typography variant="body1" fontWeight="medium">
                    {pickupLocation?.address}
                  </Typography>
                </Box>
              </Box>
              
              <Box mb={2}>
                <Typography variant="body2" color="textSecondary">
                  Dropoff
                </Typography>
                <Box display="flex" alignItems="flex-start">
                  <LocationOn 
                    color="error" 
                    fontSize="small" 
                    sx={{ mt: 0.5, mr: 1 }} 
                  />
                  <Typography variant="body1" fontWeight="medium">
                    {dropoffLocation?.address}
                  </Typography>
                </Box>
              </Box>
              
              {isScheduled && scheduledTime && (
                <Box mb={2}>
                  <Typography variant="body2" color="textSecondary">
                    Scheduled Time
                  </Typography>
                  <Box display="flex" alignItems="center">
                    <Schedule 
                      fontSize="small" 
                      sx={{ mr: 1 }} 
                    />
                    <Typography variant="body1" fontWeight="medium">
                      {format(scheduledTime, 'PPp')}
                    </Typography>
                  </Box>
                </Box>
              )}
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Box mb={2}>
                <Typography variant="body2" color="textSecondary">
                  Ride Type
                </Typography>
                <Box display="flex" alignItems="center">
                  {rideTypes.find(ride => ride.id === selectedRideType)?.icon && (
                    <Box sx={{ mr: 1, display: 'flex', alignItems: 'center' }}>
                      {rideTypes.find(ride => ride.id === selectedRideType)?.icon}
                    </Box>
                  )}
                  <Typography variant="body1" fontWeight="medium">
                    {rideTypes.find(ride => ride.id === selectedRideType)?.name || 'Economy'}
                  </Typography>
                </Box>
              </Box>
              
              <Box mb={2}>
                <Typography variant="body2" color="textSecondary">
                  Passengers
                </Typography>
                <Box display="flex" alignItems="center">
                  <Person 
                    fontSize="small" 
                    sx={{ mr: 1 }} 
                  />
                  <Typography variant="body1" fontWeight="medium">
                    {numberOfPassengers}
                  </Typography>
                </Box>
              </Box>
              
              {notes && (
                <Box mb={2}>
                  <Typography variant="body2" color="textSecondary">
                    Notes
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {notes}
                  </Typography>
                </Box>
              )}
            </Grid>
          </Grid>
        </Box>
        
        <Divider sx={{ my: 2 }} />
        
        <Box>
          <Typography variant="body2" color="textSecondary">
            Fare Breakdown
          </Typography>
          
          <Box display="flex" justifyContent="space-between" mt={1}>
            <Typography variant="body2">Base Fare</Typography>
            <Typography variant="body2">${(estimatedPrice * 0.7).toFixed(2)}</Typography>
          </Box>
          
          <Box display="flex" justifyContent="space-between" mt={1}>
            <Typography variant="body2">Distance ({estimatedDistance.toFixed(1)} miles)</Typography>
            <Typography variant="body2">${(estimatedPrice * 0.2).toFixed(2)}</Typography>
          </Box>
          
          <Box display="flex" justifyContent="space-between" mt={1}>
            <Typography variant="body2">Time ({Math.round(estimatedDuration)} min)</Typography>
            <Typography variant="body2">${(estimatedPrice * 0.1).toFixed(2)}</Typography>
          </Box>
          
          <Divider sx={{ my: 1 }} />
          
          <Box display="flex" justifyContent="space-between" mt={1}>
            <Typography variant="subtitle1" fontWeight="bold">Total</Typography>
            <Typography variant="subtitle1" fontWeight="bold" color="primary">
              ${estimatedPrice.toFixed(2)}
            </Typography>
          </Box>
        </Box>
      </Paper>
      
      <Paper elevation={0} sx={{ p: 3, borderRadius: 2, border: `1px solid ${theme.palette.divider}` }}>
        <Typography variant="h6" gutterBottom>
          Payment Method
        </Typography>
        
        <FormControl component="fieldset" sx={{ width: '100%' }}>
          <RadioGroup 
            value="card1" 
            sx={{ width: '100%' }}
          >
            <Paper 
              elevation={0} 
              sx={{ 
                p: 2, 
                mb: 2, 
                border: `1px solid ${theme.palette.primary.main}`,
                borderRadius: 1
              }}
            >
              <FormControlLabel
                value="card1"
                control={<Radio />}
                label={
                  <Box display="flex" alignItems="center">
                    <CreditCard sx={{ mr: 1 }} />
                    <Typography>•••• •••• •••• 4242 (Default)</Typography>
                    <Chip 
                      size="small" 
                      label="Default" 
                      color="primary" 
                      sx={{ ml: 1 }} 
                    />
                  </Box>
                }
              />
            </Paper>
            
            <Paper 
              elevation={0} 
              sx={{ 
                p: 2, 
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 1
              }}
            >
              <FormControlLabel
                value="card2"
                control={<Radio />}
                label={
                  <Box display="flex" alignItems="center">
                    <CreditCard sx={{ mr: 1 }} />
                    <Typography>•••• •••• •••• 5555</Typography>
                  </Box>
                }
              />
            </Paper>
          </RadioGroup>
        </FormControl>
        
        <Button
          variant="outlined"
          fullWidth
          startIcon={<CreditCard />}
          sx={{ mt: 2 }}
        >
          Add Payment Method
        </Button>
      </Paper>
    </Box>
  );
  
  // Render the appropriate step content
  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return renderLocationStep();
      case 1:
        return renderRideTypeStep();
      case 2:
        return renderPaymentStep();
      default:
        return 'Unknown step';
    }
  };
  
  return (
    <Container maxWidth="md">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom fontWeight="bold" align="center">
          Book a Ride
        </Typography>
        
        <Stepper activeStep={activeStep} sx={{ pt: 3, pb: 5 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        {getStepContent(activeStep)}
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
            variant="outlined"
            sx={{ px: 3 }}
          >
            Back
          </Button>
          
          <Button
            variant="contained"
            onClick={handleNext}
            disabled={loading}
            sx={{ px: 4 }}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {activeStep === steps.length - 1 ? 'Book Ride' : 'Next'}
          </Button>
        </Box>
      </Box>
      
      {/* Success Dialog */}
      <Dialog
        open={showSuccessDialog}
        onClose={handleSuccessDialogClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 2 }
        }}
      >
        <DialogTitle>
          <Box display="flex" alignItems="center">
            <CheckCircle color="success" sx={{ mr: 1, fontSize: 30 }} />
            <Typography variant="h5" fontWeight="bold">Ride Booked Successfully!</Typography>
          </Box>
        </DialogTitle>
        
        <DialogContent>
          <Box sx={{ mb: 2 }}>
            <Typography variant="body1">
              {isScheduled && scheduledTime 
                ? `Your ride is scheduled for ${format(scheduledTime, 'PPp')}.`
                : 'Your ride has been booked and a driver will be assigned shortly.'}
            </Typography>
          </Box>
          
          <Paper
            elevation={0}
            sx={{
              p: 2,
              backgroundColor: alpha(theme.palette.success.main, 0.1),
              borderRadius: 1,
              mb: 3
            }}
          >
            <Box display="flex" justifyContent="space-between">
              <Box>
                <Typography variant="body2">Confirmation #</Typography>
                <Typography variant="subtitle1" fontWeight="bold">
                  {Math.random().toString(36).substring(2, 10).toUpperCase()}
                </Typography>
              </Box>
              
              <Box>
                <Typography variant="body2">Estimated Arrival</Typography>
                <Typography variant="subtitle1" fontWeight="bold">
                  {isScheduled && scheduledTime 
                    ? format(scheduledTime, 'h:mm a')
                    : format(addMinutes(new Date(), 5), 'h:mm a')}
                </Typography>
              </Box>
              
              <Box>
                <Typography variant="body2">Price</Typography>
                <Typography variant="subtitle1" fontWeight="bold" color="primary">
                  ${estimatedPrice.toFixed(2)}
                </Typography>
              </Box>
            </Box>
          </Paper>
          
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Your Driver
            </Typography>
            
            <Box display="flex" alignItems="center">
              <Avatar
                sx={{ 
                  width: 50, 
                  height: 50, 
                  mr: 2, 
                  bgcolor: theme.palette.primary.main 
                }}
              >
                JD
              </Avatar>
              
              <Box>
                <Typography variant="subtitle1">John Driver</Typography>
                <Box display="flex" alignItems="center">
                  <Rating
                    value={4.8}
                    precision={0.1}
                    readOnly
                    size="small"
                    sx={{ mr: 1 }}
                  />
                  <Typography variant="body2">4.8 (328 rides)</Typography>
                </Box>
              </Box>
            </Box>
          </Box>
          
          <Typography variant="body2" color="text.secondary">
            You can view your ride details and track your driver in the Ride History section.
          </Typography>
        </DialogContent>
        
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button
            variant="outlined"
            onClick={handleSuccessDialogClose}
          >
            Close
          </Button>
          
          <Button
            variant="contained"
            color="primary"
            onClick={handleSuccessDialogClose}
            startIcon={<DirectionsCar />}
          >
            View Ride Status
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default BookRide; 