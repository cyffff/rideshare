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
import OSMMap from '../components/FreeMap';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DateTimePicker } from '@mui/x-date-pickers';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { format, addMinutes } from 'date-fns';
import locationService from '../services/LocationService';

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

// Interface for location state from Home page
interface LocationState {
  pickupLocation?: string;
  dropoffLocation?: string;
  carType?: string;
}

const BookRide: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = location.state as LocationState;
  
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
  const [selectedRideType, setSelectedRideType] = useState<string>(
    locationState?.carType || rideTypes[0].id
  );
  const [isScheduled, setIsScheduled] = useState<boolean>(false);
  const [scheduledTime, setScheduledTime] = useState<Date | null>(new Date());
  const [estimatedDistance, setEstimatedDistance] = useState<number>(0);
  const [estimatedDuration, setEstimatedDuration] = useState<number>(0);
  const [estimatedPrice, setEstimatedPrice] = useState<number>(0);
  const [numberOfPassengers, setNumberOfPassengers] = useState<number>(1);
  const [notes, setNotes] = useState<string>('');
  
  // State for map provider
  const [mapProvider, setMapProvider] = useState<'google' | 'osm'>('osm');
  
  // State for location selection
  const [isSelectingOnMap, setIsSelectingOnMap] = useState<boolean>(false);
  const [selectingPickupLocation, setSelectingPickupLocation] = useState<boolean>(true);
  
  // Add new state for location suggestions and typing
  const [pickupQuery, setPickupQuery] = useState('');
  const [dropoffQuery, setDropoffQuery] = useState('');
  const [pickupSuggestions, setPickupSuggestions] = useState<Location[]>([]);
  const [dropoffSuggestions, setDropoffSuggestions] = useState<Location[]>([]);
  const [showPickupSuggestions, setShowPickupSuggestions] = useState(false);
  const [showDropoffSuggestions, setShowDropoffSuggestions] = useState(false);
  
  // Get current user location on mount and handle prefilled data
  useEffect(() => {
    // Default to Dubai coordinates instead of San Francisco
    const defaultLocation = {
      lat: 25.2048,
      lng: 55.2708 // Dubai coordinates
    };
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          
          // For demo purposes, use Dubai as the default location
          const defaultPickup = {
            address: locationState?.pickupLocation || 'Dubai Mall, Dubai, UAE',
            coordinates: defaultLocation
          };
          setPickupLocation(defaultPickup);
          setPickupQuery(defaultPickup.address);
          
          // If dropoff was provided in state, set it
          if (locationState?.dropoffLocation) {
            // Create a mock dropoff location in UAE
            const defaultDropoff = {
              address: locationState.dropoffLocation,
              coordinates: {
                lat: defaultLocation.lat + 0.03, // Slightly offset from pickup
                lng: defaultLocation.lng + 0.04
              }
            };
            setDropoffLocation(defaultDropoff);
            setDropoffQuery(defaultDropoff.address);
            
            // Calculate estimates for the route
            setTimeout(() => {
              if (pickupLocation) {
                calculateRoute(defaultPickup, defaultDropoff);
              }
            }, 500);
          }
        },
        (error) => {
          console.error("Error getting user location", error);
          
          // Set default locations for demo in UAE
          setCurrentUserLocation(defaultLocation);
          
          const defaultPickup = {
            address: locationState?.pickupLocation || 'Dubai Mall, Dubai, UAE',
            coordinates: defaultLocation
          };
          setPickupLocation(defaultPickup);
          setPickupQuery(defaultPickup.address);
          
          // If dropoff was provided in state, set it
          if (locationState?.dropoffLocation) {
            const defaultDropoff = {
              address: locationState.dropoffLocation,
              coordinates: {
                lat: defaultLocation.lat + 0.03,
                lng: defaultLocation.lng + 0.04
              }
            };
            setDropoffLocation(defaultDropoff);
            setDropoffQuery(defaultDropoff.address);
            
            // Calculate estimates for the route
            setTimeout(() => {
              if (pickupLocation) {
                calculateRoute(defaultPickup, defaultDropoff);
              }
            }, 500);
          }
        }
      );
    }
  }, [locationState]);
  
  // Replace the current generateSuggestions function with this improved version
  const generateSuggestions = async (query: string): Promise<Location[]> => {
    if (!query || query.length < 2) return [];
    
    // Use the location service to get suggestions
    const suggestions = await locationService.getSuggestions(query);
    
    // Convert to the Location format used in this component
    return suggestions.map(suggestion => ({
      address: suggestion.description,
      coordinates: {
        lat: suggestion.lat,
        lng: suggestion.lng
      }
    }));
  };
  
  // Replace the searchAddress function with this async version
  const searchAddress = async (query: string, isPickup: boolean) => {
    if (isPickup) {
      setPickupQuery(query);
      if (query.length >= 2) {
        setLoading(true);
        try {
          const suggestions = await generateSuggestions(query);
          setPickupSuggestions(suggestions);
          setShowPickupSuggestions(true);
        } catch (err) {
          console.error("Error getting suggestions:", err);
        } finally {
          setLoading(false);
        }
      } else {
        setShowPickupSuggestions(false);
      }
    } else {
      setDropoffQuery(query);
      if (query.length >= 2) {
        setLoading(true);
        try {
          const suggestions = await generateSuggestions(query);
          setDropoffSuggestions(suggestions);
          setShowDropoffSuggestions(true);
        } catch (err) {
          console.error("Error getting suggestions:", err);
        } finally {
          setLoading(false);
        }
      } else {
        setShowDropoffSuggestions(false);
      }
    }
  };
  
  // Handle suggestion selection
  const handleSelectSuggestion = (suggestion: Location, isPickup: boolean) => {
    if (isPickup) {
      setPickupLocation(suggestion);
      setPickupQuery(suggestion.address);
      setShowPickupSuggestions(false);
    } else {
      setDropoffLocation(suggestion);
      setDropoffQuery(suggestion.address);
      setShowDropoffSuggestions(false);
    }
    
    // Only calculate route if both locations are set
    if ((isPickup && dropoffLocation) || (!isPickup && pickupLocation)) {
      const pickup = isPickup ? suggestion : pickupLocation!;
      const dropoff = isPickup ? dropoffLocation! : suggestion;
      calculateRoute(pickup, dropoff);
    }
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
  
  // Update this part to initialize the query values when locations are already set
  useEffect(() => {
    if (pickupLocation && !pickupQuery) {
      setPickupQuery(pickupLocation.address);
    }
  }, [pickupLocation, pickupQuery]);

  useEffect(() => {
    if (dropoffLocation && !dropoffQuery) {
      setDropoffQuery(dropoffLocation.address);
    }
  }, [dropoffLocation, dropoffQuery]);
  
  // Replace the calculateRoute function with this improved version
  const calculateRoute = useCallback(async (pickup: Location, dropoff: Location) => {
    try {
      // Get directions from the location service
      const directions = await locationService.getDirections(
        pickup.coordinates,
        dropoff.coordinates
      );
      
      setEstimatedDistance(directions.distance);
      setEstimatedDuration(directions.duration);
      
      // Calculate price based on distance and ride type
      calculatePrice(directions.distance);
    } catch (err) {
      console.error("Error calculating route:", err);
      
      // Fallback to basic calculation if the service fails
      const directDistance = calculateDistance(
        pickup.coordinates.lat,
        pickup.coordinates.lng,
        dropoff.coordinates.lat,
        dropoff.coordinates.lng
      );
      
      // Add realistic factor for actual roads
      const adjustedDistance = directDistance * 1.3;
      const duration = Math.round(adjustedDistance * 2);
      
      setEstimatedDistance(adjustedDistance);
      setEstimatedDuration(duration);
      calculatePrice(adjustedDistance);
    }
  }, []);
  
  // Improve the Current Location button functionality
  const handleSetCurrentLocationAsPickup = async () => {
    if (currentUserLocation) {
      let locationName = 'Current Location';
      let coordinates = { ...currentUserLocation };
      
      // Get a better location name based on search context
      if (pickupQuery && pickupQuery.length > 0) {
        const queryLower = pickupQuery.toLowerCase();
        
        // Check for key location terms in the query
        if (queryLower.includes('reem') || queryLower.includes('rem')) {
          locationName = 'Current Location (Reem Island, Abu Dhabi)';
          coordinates = { lat: 24.4991, lng: 54.4017 };
        }
        else if (queryLower.includes('abu') || queryLower.includes('dhabi') || 
                 queryLower.includes('dbu') || queryLower.includes('abo')) {
          locationName = 'Current Location (Abu Dhabi, UAE)';
          coordinates = { lat: 24.4539, lng: 54.3773 };
        } 
        else if (queryLower.includes('dubai') || queryLower.includes('dubi') || 
                 queryLower.includes('dubei')) {
          locationName = 'Current Location (Dubai, UAE)';
          coordinates = { lat: 25.2048, lng: 55.2708 };
        }
        else if (queryLower.includes('yas')) {
          locationName = 'Current Location (Yas Island, Abu Dhabi)';
          coordinates = { lat: 24.4959, lng: 54.6056 };
        }
        else if (queryLower.includes('saadiyat')) {
          locationName = 'Current Location (Saadiyat Island, Abu Dhabi)';
          coordinates = { lat: 24.5456, lng: 54.4218 };
        }
        else if (queryLower.includes('china') || queryLower.includes('beijing')) {
          locationName = 'Current Location (Beijing, China)';
          coordinates = { lat: 39.9042, lng: 116.4074 };
        }
        // Default to Abu Dhabi if we have text but no specific match
        else if (queryLower.length > 0) {
          locationName = 'Current Location (Abu Dhabi, UAE)';
          coordinates = { lat: 24.4539, lng: 54.3773 };
        }
      } else {
        // Default to Abu Dhabi for the demo
        locationName = 'Current Location (Abu Dhabi, UAE)';
        coordinates = { lat: 24.4539, lng: 54.3773 };
      }
      
      const location = {
        address: locationName,
        coordinates: coordinates
      };
      
      setPickupLocation(location);
      setPickupQuery(locationName);
      setShowPickupSuggestions(false);
      
      if (dropoffLocation) {
        calculateRoute(location, dropoffLocation);
      }
    } else {
      // If geolocation is not available, provide a reasonable default
      const defaultLocation = {
        address: 'Current Location (Abu Dhabi, UAE)',
        coordinates: { lat: 24.4539, lng: 54.3773 }
      };
      
      setPickupLocation(defaultLocation);
      setPickupQuery(defaultLocation.address);
      setShowPickupSuggestions(false);
      
      if (dropoffLocation) {
        calculateRoute(defaultLocation, dropoffLocation);
      }
    }
  };
  
  // Update handleLocationSelect to also set the query
  const handleLocationSelect = (location: { lat: number; lng: number }, isPickup: boolean) => {
    // Get address from coordinates (in a real app, this would use reverse geocoding)
    const address = isPickup 
      ? `Pickup at ${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}` 
      : `Dropoff at ${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}`;
    
    const newLocation: Location = {
      address,
      coordinates: location
    };
    
    if (isPickup) {
      setPickupLocation(newLocation);
      setPickupQuery(address);
      setShowPickupSuggestions(false);
    } else {
      setDropoffLocation(newLocation);
      setDropoffQuery(address);
      setShowDropoffSuggestions(false);
    }
    
    // Calculate route if both locations are set
    if ((isPickup && dropoffLocation) || (!isPickup && pickupLocation)) {
      calculateRoute(
        isPickup ? newLocation : pickupLocation!,
        isPickup ? dropoffLocation! : newLocation
      );
    }
    
    // Exit selection mode
    setIsSelectingOnMap(false);
  };
  
  const handleSuccessDialogClose = () => {
    setShowSuccessDialog(false);
    // In a real app, you might navigate to a ride tracking page
    navigate('/ride-history');
  };
  
  // Function to start location selection mode
  const startLocationSelection = (isPickup: boolean) => {
    setSelectingPickupLocation(isPickup);
    setIsSelectingOnMap(true);
  };
  
  // Calculate route between two locations
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 3958.8; // Earth's radius in miles
    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);
    
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c; // Distance in miles
    
    return distance;
  };
  
  // Helper function to convert degrees to radians
  const toRadians = (degrees: number): number => {
    return degrees * (Math.PI / 180);
  };
  
  // Calculate price based on distance and ride type
  const calculatePrice = (distance: number) => {
    const selectedRide = rideTypes.find(type => type.id === selectedRideType);
    if (selectedRide) {
      // Base price calculation (simplified for demo)
      const basePrice = 5 + (distance * 2.5); // $5 base fare + $2.50 per mile
      const finalPrice = basePrice * selectedRide.multiplier;
      setEstimatedPrice(finalPrice);
    }
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
            value={pickupQuery}
            onChange={(e) => searchAddress(e.target.value, true)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LocationOn color="primary" />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <Box sx={{ display: 'flex' }}>
                    <Button 
                      size="small" 
                      startIcon={<MyLocation />}
                      onClick={handleSetCurrentLocationAsPickup}
                      sx={{ mr: 1 }}
                    >
                      Current
                    </Button>
                    <Button
                      size="small"
                      color="primary"
                      onClick={() => startLocationSelection(true)}
                    >
                      Select on Map
                    </Button>
                  </Box>
                </InputAdornment>
              )
            }}
            sx={{ mb: showPickupSuggestions ? 0 : 2 }}
          />
          
          {showPickupSuggestions && pickupSuggestions.length > 0 && (
            <Paper 
              elevation={3} 
              sx={{ 
                mt: 0.5, 
                mb: 2, 
                maxHeight: '200px',
                overflow: 'auto',
                zIndex: 2,
                position: 'relative'
              }}
            >
              {pickupSuggestions.map((suggestion, index) => (
                <Box 
                  key={index}
                  sx={{ 
                    p: 1.5, 
                    cursor: 'pointer',
                    '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' },
                    borderBottom: index < pickupSuggestions.length - 1 ? '1px solid #eee' : 'none'
                  }}
                  onClick={() => handleSelectSuggestion(suggestion, true)}
                >
                  <Typography variant="body2">{suggestion.address}</Typography>
                </Box>
              ))}
            </Paper>
          )}
          
          <TextField
            fullWidth
            label="Dropoff Location"
            variant="outlined"
            value={dropoffQuery}
            onChange={(e) => searchAddress(e.target.value, false)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LocationOn color="error" />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <Button
                    size="small"
                    color="primary"
                    onClick={() => startLocationSelection(false)}
                  >
                    Select on Map
                  </Button>
                </InputAdornment>
              )
            }}
            sx={{ mb: showDropoffSuggestions ? 0 : 2 }}
          />
          
          {showDropoffSuggestions && dropoffSuggestions.length > 0 && (
            <Paper 
              elevation={3} 
              sx={{ 
                mt: 0.5, 
                mb: 2, 
                maxHeight: '200px',
                overflow: 'auto',
                zIndex: 2,
                position: 'relative'
              }}
            >
              {dropoffSuggestions.map((suggestion, index) => (
                <Box 
                  key={index}
                  sx={{ 
                    p: 1.5, 
                    cursor: 'pointer',
                    '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' },
                    borderBottom: index < dropoffSuggestions.length - 1 ? '1px solid #eee' : 'none'
                  }}
                  onClick={() => handleSelectSuggestion(suggestion, false)}
                >
                  <Typography variant="body2">{suggestion.address}</Typography>
                </Box>
              ))}
            </Paper>
          )}
        </Box>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box>
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
          </Box>
          
          <Box>
            <FormControlLabel
              control={
                <Radio
                  checked={mapProvider === 'osm'}
                  onChange={() => setMapProvider('osm')}
                />
              }
              label="OSM"
            />
            
            <FormControlLabel
              control={
                <Radio
                  checked={mapProvider === 'google'}
                  onChange={() => setMapProvider('google')}
                />
              }
              label="Google Map"
            />
          </Box>
        </Box>
        
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
      
      <Paper sx={{ 
        p: 2, 
        borderRadius: 2, 
        border: `1px solid ${theme.palette.divider}`,
        height: '300px', 
        overflow: 'hidden'
      }}>
        {mapProvider === 'google' ? (
          <GoogleMap
            pickupLocation={pickupLocation?.coordinates}
            dropoffLocation={dropoffLocation?.coordinates}
            currentLocation={currentUserLocation || undefined}
            showDirections={!!(pickupLocation && dropoffLocation)}
            height="100%"
            onRouteCalculated={handleRouteCalculated}
          />
        ) : (
          <OSMMap
            pickupLocation={pickupLocation?.coordinates}
            dropoffLocation={dropoffLocation?.coordinates}
            currentLocation={currentUserLocation || undefined}
            showDirections={!!(pickupLocation && dropoffLocation)}
            height="100%"
            onRouteCalculated={handleRouteCalculated}
            onLocationSelect={handleLocationSelect}
            isSelectingLocation={isSelectingOnMap}
            selectingPickup={selectingPickupLocation}
          />
        )}
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
  
  // Replace the Success Dialog with this enhanced version
  const renderSuccessDialog = () => (
    <Dialog
      open={showSuccessDialog}
      onClose={handleSuccessDialogClose}
      maxWidth="md"
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
        {/* Map view */}
        <Box sx={{ height: '250px', mb: 3, borderRadius: 2, overflow: 'hidden' }}>
          {mapProvider === 'google' ? (
            <GoogleMap
              pickupLocation={pickupLocation?.coordinates}
              dropoffLocation={dropoffLocation?.coordinates}
              showDirections={true}
              height="250px"
            />
          ) : (
            <OSMMap
              pickupLocation={pickupLocation?.coordinates}
              dropoffLocation={dropoffLocation?.coordinates}
              showDirections={true}
              height="250px"
            />
          )}
        </Box>

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

        {/* Ride Details Panel */}
        <Paper
          elevation={0}
          sx={{
            p: 2,
            borderRadius: 1,
            border: `1px solid ${theme.palette.divider}`,
            mb: 3
          }}
        >
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
            Ride Details
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Box display="flex" alignItems="flex-start" mb={1.5}>
                <LocationOn color="primary" fontSize="small" sx={{ mt: 0.5, mr: 1 }} />
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Pickup
                  </Typography>
                  <Typography variant="body2" fontWeight={500}>
                    {pickupLocation?.address}
                  </Typography>
                </Box>
              </Box>
              
              <Box display="flex" alignItems="flex-start">
                <LocationOn color="error" fontSize="small" sx={{ mt: 0.5, mr: 1 }} />
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Dropoff
                  </Typography>
                  <Typography variant="body2" fontWeight={500}>
                    {dropoffLocation?.address}
                  </Typography>
                </Box>
              </Box>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Box display="flex" alignItems="center" mb={1.5}>
                <DirectionsCar fontSize="small" sx={{ mr: 1 }} />
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Ride Type
                  </Typography>
                  <Typography variant="body2" fontWeight={500}>
                    {rideTypes.find(ride => ride.id === selectedRideType)?.name || 'Economy'}
                  </Typography>
                </Box>
              </Box>
              
              <Box display="flex" alignItems="center">
                <AccessTime fontSize="small" sx={{ mr: 1 }} />
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Est. Duration
                  </Typography>
                  <Typography variant="body2" fontWeight={500}>
                    {Math.round(estimatedDuration)} min ({estimatedDistance.toFixed(1)} miles)
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
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
  );
  
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
      {renderSuccessDialog()}
    </Container>
  );
};

export default BookRide; 