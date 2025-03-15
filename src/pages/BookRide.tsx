import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  CircularProgress,
  Grid,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  IconButton,
  InputAdornment,
  Link,
  ToggleButtonGroup,
  ToggleButton,
  Tooltip,
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import SwapVertIcon from '@mui/icons-material/SwapVert';
import MapIcon from '@mui/icons-material/Map';
import LocationSearch from '../components/LocationSearch';
import GoogleMap from '../components/GoogleMap';
import OpenStreetMap from '../components/OpenStreetMap';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

// Initialize Stripe
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || '');

const BookRide = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  // Change default map type to 'openstreetmap'
  const [mapType, setMapType] = useState<'google' | 'openstreetmap'>('openstreetmap');
  
  const [rideData, setRideData] = useState({
    pickupLocation: '',
    dropoffLocation: '',
    rideTime: new Date(),
    seats: 1,
    luggageSize: 'SMALL',
    notes: '',
  });
  
  const [pickupCoordinates, setPickupCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [dropoffCoordinates, setDropoffCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [price, setPrice] = useState<number | null>(null);
  const [clientSecret, setClientSecret] = useState('');

  useEffect(() => {
    // Redirect to login if user is not authenticated
    if (!currentUser) {
      navigate('/login', { state: { from: '/book' } });
    }
  }, [currentUser, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setRideData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (e: SelectChangeEvent) => {
    const { name, value } = e.target;
    setRideData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDateChange = (newValue: Date | null) => {
    if (newValue) {
      setRideData((prev) => ({
        ...prev,
        rideTime: newValue,
      }));
    }
  };

  const handlePickupLocationChange = (value: string, coordinates?: { lat: number; lng: number }) => {
    setRideData((prev) => ({
      ...prev,
      pickupLocation: value,
    }));
    
    if (coordinates) {
      setPickupCoordinates(coordinates);
      console.log('Pickup coordinates set:', coordinates);
    } else {
      console.log('No coordinates provided for pickup location:', value);
    }
  };

  const handleDropoffLocationChange = (value: string, coordinates?: { lat: number; lng: number }) => {
    setRideData((prev) => ({
      ...prev,
      dropoffLocation: value,
    }));
    
    if (coordinates) {
      setDropoffCoordinates(coordinates);
      console.log('Dropoff coordinates set:', coordinates);
    } else {
      console.log('No coordinates provided for dropoff location:', value);
    }
  };

  const handleGetCurrentLocation = async () => {
    if ('geolocation' in navigator) {
      try {
        setLoading(true);
        setError(''); // Clear any previous errors
        console.log('Getting current location...');
        
        // Show user feedback
        setRideData(prev => ({
          ...prev,
          pickupLocation: 'Detecting your location...'
        }));
        
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          // Increase timeout to 15 seconds and show a more visible loading indicator
          const geolocationWatchId = navigator.geolocation.watchPosition(
            (position) => {
              // Successfully got position, clear watch and resolve
              navigator.geolocation.clearWatch(geolocationWatchId);
              resolve(position);
            },
            (error) => {
              // Error getting position, clear watch and reject
              navigator.geolocation.clearWatch(geolocationWatchId);
              reject(error);
            },
            {
              enableHighAccuracy: true,
              timeout: 15000,
              maximumAge: 0
            }
          );
          
          // Also set a backup timeout just in case
          setTimeout(() => {
            navigator.geolocation.clearWatch(geolocationWatchId);
            reject(new Error('Location request timed out. Please try again or enter your location manually.'));
          }, 16000);
        });

        const { latitude, longitude } = position.coords;
        console.log('Current location:', latitude, longitude);
        
        // Set coordinates
        const coordinates = { lat: latitude, lng: longitude };
        setPickupCoordinates(coordinates);
        
        // Use OpenStreetMap's Nominatim for reverse geocoding if using OSM or if Google Maps API is not available
        if (mapType === 'openstreetmap' || !window.google || !window.google.maps) {
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
            );
            
            if (!response.ok) {
              throw new Error(`Nominatim API error: ${response.status}`);
            }
            
            const data = await response.json();
            if (data && data.display_name) {
              setRideData((prev) => ({
                ...prev,
                pickupLocation: data.display_name,
              }));
            } else {
              // Fallback to coordinates if reverse geocoding fails
              setRideData((prev) => ({
                ...prev,
                pickupLocation: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
              }));
            }
            setLoading(false);
            return;
          } catch (err) {
            console.error('Error with Nominatim reverse geocoding:', err);
            // Fallback to coordinates
            setRideData((prev) => ({
              ...prev,
              pickupLocation: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
            }));
            setLoading(false);
            return;
          }
        }
        
        // Use Google Maps for reverse geocoding if available
        try {
          const geocoder = new google.maps.Geocoder();
          geocoder.geocode({ location: coordinates }, (results, status) => {
            if (status === google.maps.GeocoderStatus.OK && results && results[0]) {
              const address = results[0].formatted_address;
              console.log('Geocoded address:', address);
              setRideData((prev) => ({
                ...prev,
                pickupLocation: address,
              }));
            } else {
              console.error('Geocoding failed:', status);
              // Fallback to coordinates if geocoding fails
              setRideData((prev) => ({
                ...prev,
                pickupLocation: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
              }));
            }
            setLoading(false);
          });
        } catch (geocodeErr) {
          console.error('Error during geocoding:', geocodeErr);
          setRideData((prev) => ({
            ...prev,
            pickupLocation: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
          }));
          setLoading(false);
        }
      } catch (err) {
        console.error('Geolocation error:', err);
        if (err instanceof GeolocationPositionError) {
          switch (err.code) {
            case err.PERMISSION_DENIED:
              setError('Location access denied. Please enable location services in your browser settings and try again.');
              break;
            case err.POSITION_UNAVAILABLE:
              setError('Location information is unavailable. Please try again or enter your location manually.');
              break;
            case err.TIMEOUT:
              setError('Location request timed out. Please try again or enter your location manually.');
              break;
            default:
              setError('Failed to get current location. Please try again or enter your location manually.');
          }
        } else {
          setError(`Failed to get location: ${err instanceof Error ? err.message : 'Unknown error'}. Please enter your location manually.`);
        }
        
        // Reset the pickup location field if there was an error
        setRideData(prev => ({
          ...prev,
          pickupLocation: ''
        }));
        
        setLoading(false);
      }
    } else {
      setError('Geolocation is not supported by your browser. Please enter your location manually.');
    }
  };

  const handleSwapLocations = () => {
    setRideData((prev) => ({
      ...prev,
      pickupLocation: prev.dropoffLocation,
      dropoffLocation: prev.pickupLocation,
    }));
    
    // Swap coordinates too
    const tempCoords = pickupCoordinates;
    setPickupCoordinates(dropoffCoordinates);
    setDropoffCoordinates(tempCoords);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    console.log('Submitting ride request with data:', {
      ...rideData,
      pickupCoordinates,
      dropoffCoordinates
    });

    try {
      // First, get a price estimate
      console.log('Fetching price estimate...');
      console.log('Request payload:', JSON.stringify({
        ...rideData,
        pickupCoordinates,
        dropoffCoordinates
      }, null, 2));
      
      const estimateResponse = await fetch('/api/rides/estimate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUser?.token || ''}`,
        },
        body: JSON.stringify({
          ...rideData,
          pickupCoordinates,
          dropoffCoordinates
        }),
      });

      console.log('Estimate response status:', estimateResponse.status);
      
      if (!estimateResponse.ok) {
        const errorText = await estimateResponse.text();
        console.error('Estimate error:', errorText);
        throw new Error(`Failed to get price estimate: ${errorText}`);
      }

      const estimateData = await estimateResponse.json();
      console.log('Estimate data:', estimateData);
      setPrice(estimateData.price);

      // Create a payment intent
      console.log('Creating payment intent...');
      const paymentResponse = await fetch('/api/rides/payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUser?.token || ''}`,
        },
        body: JSON.stringify({
          ...rideData,
          pickupCoordinates,
          dropoffCoordinates,
          amount: estimateData.price,
        }),
      });

      console.log('Payment intent response status:', paymentResponse.status);
      
      if (!paymentResponse.ok) {
        const errorText = await paymentResponse.text();
        console.error('Payment intent error:', errorText);
        throw new Error(`Failed to create payment intent: ${errorText}`);
      }

      const paymentData = await paymentResponse.json();
      console.log('Payment intent data:', paymentData);
      setClientSecret(paymentData.clientSecret);
    } catch (err) {
      console.error('Error in handleSubmit:', err);
      setError(`Failed to book ride: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  // Handle map type change
  const handleMapTypeChange = (
    event: React.MouseEvent<HTMLElement>,
    newMapType: 'google' | 'openstreetmap' | null,
  ) => {
    if (newMapType !== null) {
      setMapType(newMapType);
      
      // Force refresh of coordinates when map type changes
      if (pickupCoordinates) {
        setPickupCoordinates({...pickupCoordinates});
      }
      if (dropoffCoordinates) {
        setDropoffCoordinates({...dropoffCoordinates});
      }
      
      console.log(`Map type changed to ${newMapType}, refreshing coordinates`);
    }
  };

  // Add effect to refresh map when coordinates change
  useEffect(() => {
    console.log('Coordinates updated:', { pickupCoordinates, dropoffCoordinates });
  }, [pickupCoordinates, dropoffCoordinates, mapType]);

  // If user is not authenticated, don't render the component
  if (!currentUser) {
    return null;
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 8, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" component="h1" align="center" gutterBottom>
            Book a Ride
          </Typography>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
              {error.includes('Google Maps API') && (
                <Typography variant="caption" sx={{ display: 'block', mt: 1 }}>
                  Visit the <Link href="/api-help" color="inherit" underline="always">API Help Page</Link> for instructions on fixing Google Maps API issues, or switch to OpenStreetMap below.
                </Typography>
              )}
            </Alert>
          )}
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <LocationSearch
                      label="Pickup Location"
                      value={rideData.pickupLocation}
                      onChange={handlePickupLocationChange}
                      required
                      mapType={mapType}
                    />
                    <IconButton onClick={handleGetCurrentLocation} sx={{ ml: 1 }}>
                      <MyLocationIcon />
                    </IconButton>
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                    <IconButton onClick={handleSwapLocations}>
                      <SwapVertIcon />
                    </IconButton>
                  </Box>
                  
                  <LocationSearch
                    label="Dropoff Location"
                    value={rideData.dropoffLocation}
                    onChange={handleDropoffLocationChange}
                    required
                    mapType={mapType}
                  />
                  
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DateTimePicker
                      label="Ride Time"
                      value={rideData.rideTime}
                      onChange={handleDateChange}
                      sx={{ width: '100%' }}
                    />
                  </LocalizationProvider>
                  
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <FormControl fullWidth>
                        <InputLabel>Seats</InputLabel>
                        <Select
                          name="seats"
                          value={rideData.seats.toString()}
                          label="Seats"
                          onChange={handleSelectChange}
                        >
                          {[1, 2, 3, 4].map((num) => (
                            <MenuItem key={num} value={num}>
                              {num} {num === 1 ? 'seat' : 'seats'}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={6}>
                      <FormControl fullWidth>
                        <InputLabel>Luggage Size</InputLabel>
                        <Select
                          name="luggageSize"
                          value={rideData.luggageSize}
                          label="Luggage Size"
                          onChange={handleSelectChange}
                        >
                          <MenuItem value="NONE">None</MenuItem>
                          <MenuItem value="SMALL">Small</MenuItem>
                          <MenuItem value="MEDIUM">Medium</MenuItem>
                          <MenuItem value="LARGE">Large</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                  </Grid>
                  
                  <TextField
                    fullWidth
                    label="Additional Notes"
                    name="notes"
                    value={rideData.notes}
                    onChange={handleChange}
                    multiline
                    rows={3}
                    placeholder="Any special requirements or information for the driver"
                  />
                </Box>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Box sx={{ height: '100%', minHeight: '400px', display: 'flex', flexDirection: 'column' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">
                      Route Preview
                    </Typography>
                    <ToggleButtonGroup
                      value={mapType}
                      exclusive
                      onChange={handleMapTypeChange}
                      size="small"
                    >
                      <ToggleButton value="google">
                        <Tooltip title="Google Maps">
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <img 
                              src="https://developers.google.com/static/maps/images/maps-icon.svg" 
                              alt="Google Maps" 
                              style={{ height: 20, marginRight: 4 }} 
                            />
                            Google
                          </Box>
                        </Tooltip>
                      </ToggleButton>
                      <ToggleButton value="openstreetmap">
                        <Tooltip title="OpenStreetMap (Free)">
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <MapIcon sx={{ mr: 0.5 }} />
                            OSM
                          </Box>
                        </Tooltip>
                      </ToggleButton>
                    </ToggleButtonGroup>
                  </Box>
                  <Box sx={{ flexGrow: 1, borderRadius: '8px', overflow: 'hidden' }}>
                    {mapType === 'google' ? (
                      <GoogleMap
                        pickupLocation={pickupCoordinates || undefined}
                        dropoffLocation={dropoffCoordinates || undefined}
                        showDirections={!!(pickupCoordinates && dropoffCoordinates)}
                        height="100%"
                      />
                    ) : (
                      <OpenStreetMap
                        pickupLocation={pickupCoordinates || undefined}
                        dropoffLocation={dropoffCoordinates || undefined}
                        showDirections={!!(pickupCoordinates && dropoffCoordinates)}
                        height="100%"
                      />
                    )}
                  </Box>
                </Box>
              </Grid>
            </Grid>

            {price && (
              <Box sx={{ mt: 3, mb: 2, textAlign: 'center' }}>
                <Typography variant="h5" gutterBottom>
                  Estimated Price: ${price.toFixed(2)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Final price may vary based on actual distance and time
                </Typography>
              </Box>
            )}

            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              size="large"
              sx={{ mt: 3 }}
              disabled={loading || !pickupCoordinates || !dropoffCoordinates}
            >
              {loading ? <CircularProgress size={24} /> : 'Get Estimate & Book'}
            </Button>
          </form>

          {clientSecret && (
            <Box sx={{ mt: 4 }}>
              <Divider sx={{ mb: 3 }} />
              <Typography variant="h6" gutterBottom>
                Payment Details
              </Typography>
              <Elements stripe={stripePromise} options={{ clientSecret }}>
                {/* Add your payment form component here */}
              </Elements>
            </Box>
          )}
        </Paper>
      </Box>
    </Container>
  );
};

export default BookRide; 