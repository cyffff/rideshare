import React, { useState, useCallback, useEffect } from 'react';
import {
  Box,
  Button,
  Container,
  Paper,
  TextField,
  Typography,
  CircularProgress,
  Grid,
  FormControlLabel,
  Switch,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { LoadScript, GoogleMap, Marker, DirectionsRenderer } from '@react-google-maps/api';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const libraries: ("places" | "drawing" | "geometry" | "localContext" | "visualization")[] = ['places'];

const BookRide: React.FC = () => {
  const navigate = useNavigate();
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [directionsService, setDirectionsService] = useState<google.maps.DirectionsService | null>(null);
  const [directionsRenderer, setDirectionsRenderer] = useState<google.maps.DirectionsRenderer | null>(null);
  const [currentLocation, setCurrentLocation] = useState<google.maps.LatLngLiteral | null>(null);
  const [pickupAutocomplete, setPickupAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);
  const [dropoffAutocomplete, setDropoffAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);
  const [isCalculating, setIsCalculating] = useState<boolean>(false);
  const [rideDetails, setRideDetails] = useState({
    pickupLocation: '',
    dropoffLocation: '',
    pickupLatitude: 0,
    pickupLongitude: 0,
    dropoffLatitude: 0,
    dropoffLongitude: 0,
    estimatedDistance: 0,
    estimatedDuration: 0,
    isShared: false,
    isScheduled: false,
    scheduledTime: new Date(),
    estimatedPrice: 0
  });
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
  const [showConfirmation, setShowConfirmation] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const mapContainerStyle = {
    width: '100%',
    height: '400px',
  };

  const defaultCenter = {
    lat: 40.7128,
    lng: -74.006,
  };

  // Load current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        () => {
          setError('Error retrieving your location');
        }
      );
    }
  }, []);

  // Handle map load
  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map);
    setDirectionsService(new google.maps.DirectionsService());
    setDirectionsRenderer(new google.maps.DirectionsRenderer({ map }));
    setIsLoaded(true);
  }, []);

  // Set up autocomplete
  const onPickupAutocompleteLoad = (autocomplete: google.maps.places.Autocomplete) => {
    setPickupAutocomplete(autocomplete);
  };

  const onDropoffAutocompleteLoad = (autocomplete: google.maps.places.Autocomplete) => {
    setDropoffAutocomplete(autocomplete);
  };

  // Handle place selection
  const onPickupPlaceChanged = () => {
    if (pickupAutocomplete) {
      const place = pickupAutocomplete.getPlace();
      if (place.geometry && place.geometry.location) {
        setRideDetails({
          ...rideDetails,
          pickupLocation: place.formatted_address || '',
          pickupLatitude: place.geometry.location.lat(),
          pickupLongitude: place.geometry.location.lng()
        });
        calculateRoute();
      }
    }
  };

  const onDropoffPlaceChanged = () => {
    if (dropoffAutocomplete) {
      const place = dropoffAutocomplete.getPlace();
      if (place.geometry && place.geometry.location) {
        setRideDetails({
          ...rideDetails,
          dropoffLocation: place.formatted_address || '',
          dropoffLatitude: place.geometry.location.lat(),
          dropoffLongitude: place.geometry.location.lng()
        });
        calculateRoute();
      }
    }
  };

  // Calculate route
  const calculateRoute = useCallback(() => {
    if (
      directionsService &&
      rideDetails.pickupLatitude &&
      rideDetails.pickupLongitude &&
      rideDetails.dropoffLatitude &&
      rideDetails.dropoffLongitude
    ) {
      setIsCalculating(true);
      
      const origin = { lat: rideDetails.pickupLatitude, lng: rideDetails.pickupLongitude };
      const destination = { lat: rideDetails.dropoffLatitude, lng: rideDetails.dropoffLongitude };
      
      directionsService.route(
        {
          origin,
          destination,
          travelMode: google.maps.TravelMode.DRIVING,
        },
        (result, status) => {
          if (status === google.maps.DirectionsStatus.OK && result) {
            setDirections(result);
            
            if (directionsRenderer) {
              directionsRenderer.setDirections(result);
            }
            
            const route = result.routes[0];
            const leg = route.legs[0];
            const distance = leg.distance?.value || 0; // in meters
            const duration = leg.duration?.value || 0; // in seconds
            
            // Convert to appropriate units
            const distanceInKm = distance / 1000;
            const durationInMinutes = Math.ceil(duration / 60);
            
            // Calculate price (base fare + distance fare + time fare)
            const baseFare = 5;
            const distanceFare = distanceInKm * 2; // $2 per km
            const timeFare = durationInMinutes * 0.5; // $0.5 per minute
            const totalPrice = baseFare + distanceFare + timeFare;
            
            setRideDetails({
              ...rideDetails,
              estimatedDistance: distanceInKm,
              estimatedDuration: durationInMinutes,
              estimatedPrice: totalPrice
            });
          } else {
            setError('Could not calculate route');
          }
          
          setIsCalculating(false);
        }
      );
    }
  }, [directionsService, directionsRenderer, rideDetails]);

  // Handle booking submission
  const handleBookRide = async () => {
    try {
      setLoading(true);
      
      const rideRequest = {
        pickupLocation: rideDetails.pickupLocation,
        dropoffLocation: rideDetails.dropoffLocation,
        pickupLatitude: rideDetails.pickupLatitude,
        pickupLongitude: rideDetails.pickupLongitude,
        dropoffLatitude: rideDetails.dropoffLatitude,
        dropoffLongitude: rideDetails.dropoffLongitude,
        estimatedDistance: rideDetails.estimatedDistance,
        estimatedDuration: rideDetails.estimatedDuration,
        isShared: rideDetails.isShared,
        isScheduled: rideDetails.isScheduled,
        scheduledTime: rideDetails.isScheduled ? rideDetails.scheduledTime.toISOString() : null
      };
      
      // Call the appropriate endpoint based on whether it's a scheduled ride
      const endpoint = rideDetails.isScheduled ? '/api/rides/schedule' : '/api/rides';
      const response = await axios.post(endpoint, rideRequest);
      
      setLoading(false);
      setShowConfirmation(true);
    } catch (error) {
      setLoading(false);
      if (axios.isAxiosError(error) && error.response) {
        setError(error.response.data.error || 'Failed to book ride');
      } else {
        setError('An unexpected error occurred');
      }
    }
  };

  const handleConfirmationClose = () => {
    setShowConfirmation(false);
    navigate('/ride-history');
  };

  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 4, my: 4 }}>
        <Typography variant="h4" gutterBottom>
          Book a Ride
        </Typography>
        
        <LoadScript
          googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY || ''}
          libraries={libraries}
        >
          <Box my={3}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="subtitle1">Pickup Location</Typography>
                {isLoaded && (
                  <TextField
                    fullWidth
                    id="pickup-location"
                    placeholder="Enter pickup location"
                    value={rideDetails.pickupLocation}
                    onChange={(e) => setRideDetails({ ...rideDetails, pickupLocation: e.target.value })}
                    inputProps={{
                      onFocus: (e) => {
                        const input = e.target as HTMLInputElement;
                        if (!pickupAutocomplete) {
                          const autocomplete = new google.maps.places.Autocomplete(input, {
                            fields: ['formatted_address', 'geometry'],
                          });
                          autocomplete.addListener('place_changed', onPickupPlaceChanged);
                          setPickupAutocomplete(autocomplete);
                        }
                      },
                    }}
                  />
                )}
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="subtitle1">Dropoff Location</Typography>
                {isLoaded && (
                  <TextField
                    fullWidth
                    id="dropoff-location"
                    placeholder="Enter dropoff location"
                    value={rideDetails.dropoffLocation}
                    onChange={(e) => setRideDetails({ ...rideDetails, dropoffLocation: e.target.value })}
                    inputProps={{
                      onFocus: (e) => {
                        const input = e.target as HTMLInputElement;
                        if (!dropoffAutocomplete) {
                          const autocomplete = new google.maps.places.Autocomplete(input, {
                            fields: ['formatted_address', 'geometry'],
                          });
                          autocomplete.addListener('place_changed', onDropoffPlaceChanged);
                          setDropoffAutocomplete(autocomplete);
                        }
                      },
                    }}
                  />
                )}
              </Grid>
            </Grid>
          </Box>
          
          <Box my={3}>
            <GoogleMap
              mapContainerStyle={mapContainerStyle}
              center={currentLocation || defaultCenter}
              zoom={13}
              onLoad={onLoad}
            >
              {currentLocation && (
                <Marker position={currentLocation} label="You are here" />
              )}
              {directions && <DirectionsRenderer directions={directions} />}
            </GoogleMap>
          </Box>
          
          <Box my={3}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={rideDetails.isShared}
                      onChange={(e) => setRideDetails({ ...rideDetails, isShared: e.target.checked })}
                    />
                  }
                  label="Shared Ride (Lower Price)"
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={rideDetails.isScheduled}
                      onChange={(e) => setRideDetails({ ...rideDetails, isScheduled: e.target.checked })}
                    />
                  }
                  label="Schedule for Later"
                />
              </Grid>
              
              {rideDetails.isScheduled && (
                <Grid item xs={12}>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DateTimePicker
                      label="Pickup Time"
                      value={rideDetails.scheduledTime}
                      onChange={(newValue) => {
                        if (newValue) {
                          setRideDetails({ ...rideDetails, scheduledTime: newValue });
                        }
                      }}
                    />
                  </LocalizationProvider>
                </Grid>
              )}
            </Grid>
          </Box>
          
          {rideDetails.estimatedDistance > 0 && (
            <Box my={3} p={2} sx={{ backgroundColor: '#f5f5f5', borderRadius: 1 }}>
              <Typography variant="h6" gutterBottom>
                Ride Details
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <Typography variant="body2" color="textSecondary">
                    Distance
                  </Typography>
                  <Typography variant="body1">
                    {rideDetails.estimatedDistance.toFixed(1)} km
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography variant="body2" color="textSecondary">
                    Duration
                  </Typography>
                  <Typography variant="body1">
                    {rideDetails.estimatedDuration} min
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography variant="body2" color="textSecondary">
                    Price
                  </Typography>
                  <Typography variant="body1" fontWeight="bold">
                    ${rideDetails.estimatedPrice.toFixed(2)}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          )}
          
          <Box display="flex" justifyContent="center" mt={4}>
            <Button
              variant="contained"
              color="primary"
              size="large"
              onClick={handleBookRide}
              disabled={!rideDetails.pickupLocation || !rideDetails.dropoffLocation || loading}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Book Ride'}
            </Button>
          </Box>
        </LoadScript>
        
        <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError(null)}>
          <Alert onClose={() => setError(null)} severity="error">
            {error}
          </Alert>
        </Snackbar>
        
        <Dialog open={showConfirmation} onClose={handleConfirmationClose}>
          <DialogTitle>Ride Booked Successfully!</DialogTitle>
          <DialogContent>
            <Typography>
              {rideDetails.isScheduled 
                ? `Your ride has been scheduled for ${rideDetails.scheduledTime.toLocaleString()}.`
                : 'Your ride request has been sent. A driver will accept it shortly.'}
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleConfirmationClose} color="primary">
              View Ride History
            </Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </Container>
  );
};

export default BookRide; 