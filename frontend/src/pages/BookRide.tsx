import React, { useState } from 'react';
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
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import SwapVertIcon from '@mui/icons-material/SwapVert';
import LocationSearch from '../components/LocationSearch';
import GoogleMap from '../components/GoogleMap';

// Initialize Stripe
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || '');

const BookRide = () => {
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
    }
  };

  const handleDropoffLocationChange = (value: string, coordinates?: { lat: number; lng: number }) => {
    setRideData((prev) => ({
      ...prev,
      dropoffLocation: value,
    }));
    
    if (coordinates) {
      setDropoffCoordinates(coordinates);
    }
  };

  const handleGetCurrentLocation = async () => {
    if ('geolocation' in navigator) {
      try {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject);
        });

        const { latitude, longitude } = position.coords;
        
        // Set coordinates
        const coordinates = { lat: latitude, lng: longitude };
        setPickupCoordinates(coordinates);
        
        // Use reverse geocoding to get address
        const geocoder = new google.maps.Geocoder();
        geocoder.geocode({ location: coordinates }, (results, status) => {
          if (status === google.maps.GeocoderStatus.OK && results && results[0]) {
            const address = results[0].formatted_address;
            setRideData((prev) => ({
              ...prev,
              pickupLocation: address,
            }));
          } else {
            // Fallback to coordinates if geocoding fails
            setRideData((prev) => ({
              ...prev,
              pickupLocation: `${latitude}, ${longitude}`,
            }));
          }
        });
      } catch (err) {
        setError('Failed to get current location');
      }
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

    try {
      // First, get a price estimate
      const estimateResponse = await fetch('/api/rides/estimate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          ...rideData,
          pickupCoordinates,
          dropoffCoordinates
        }),
      });

      if (!estimateResponse.ok) {
        throw new Error('Failed to get price estimate');
      }

      const estimateData = await estimateResponse.json();
      setPrice(estimateData.price);

      // Create a payment intent
      const paymentResponse = await fetch('/api/rides/payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          ...rideData,
          pickupCoordinates,
          dropoffCoordinates,
          amount: estimateData.price,
        }),
      });

      if (!paymentResponse.ok) {
        throw new Error('Failed to create payment intent');
      }

      const { clientSecret } = await paymentResponse.json();
      setClientSecret(clientSecret);
    } catch (err) {
      setError('Failed to book ride. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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
                  <Typography variant="h6" gutterBottom>
                    Route Preview
                  </Typography>
                  <Box sx={{ flexGrow: 1, borderRadius: '8px', overflow: 'hidden' }}>
                    <GoogleMap
                      pickupLocation={pickupCoordinates || undefined}
                      dropoffLocation={dropoffCoordinates || undefined}
                      showDirections={!!(pickupCoordinates && dropoffCoordinates)}
                      height="100%"
                    />
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