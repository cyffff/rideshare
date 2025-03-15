import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, Alert, Button, Link, Divider, CircularProgress } from '@mui/material';
import { useJsApiLoader } from '@react-google-maps/api';

const ApiTest: React.FC = () => {
  const [apiStatus, setApiStatus] = useState<string>('Checking API status...');
  const [placesStatus, setPlacesStatus] = useState<string>('Checking Places API...');
  const [geocodingStatus, setGeocodingStatus] = useState<string>('Checking Geocoding API...');
  const [directionsStatus, setDirectionsStatus] = useState<string>('Checking Directions API...');
  const [isRunningTests, setIsRunningTests] = useState<boolean>(true);
  
  const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY || '';
  const libraries = (process.env.REACT_APP_GOOGLE_MAPS_LIBRARIES || 'places').split(',');
  
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: apiKey,
    libraries: libraries as any
  });

  const runTests = () => {
    setIsRunningTests(true);
    setApiStatus('Checking API status...');
    setPlacesStatus('Checking Places API...');
    setGeocodingStatus('Checking Geocoding API...');
    setDirectionsStatus('Checking Directions API...');
    
    if (loadError) {
      setApiStatus(`Error loading Google Maps API: ${loadError.message}`);
      setIsRunningTests(false);
      return;
    }
    
    if (!isLoaded) {
      setApiStatus('Google Maps API is still loading...');
      return;
    }
    
    setApiStatus('Google Maps API loaded successfully!');
    
    // Test Places API
    try {
      if (!window.google || !window.google.maps || !window.google.maps.places) {
        setPlacesStatus('Places API not available. Make sure it is enabled in your Google Cloud Console.');
      } else {
        const autocompleteService = new google.maps.places.AutocompleteService();
        
        autocompleteService.getPlacePredictions(
          {
            input: 'San Francisco',
            types: ['address', 'establishment', 'geocode']
          },
          (predictions, status) => {
            if (status === google.maps.places.PlacesServiceStatus.OK && predictions && predictions.length > 0) {
              setPlacesStatus(`✅ Places API working! Found ${predictions.length} predictions for "San Francisco"`);
            } else {
              setPlacesStatus(`❌ Places API error: ${status}`);
            }
          }
        );
      }
    } catch (error) {
      setPlacesStatus(`❌ Error initializing Places API: ${error instanceof Error ? error.message : String(error)}`);
    }
    
    // Test Geocoding API
    try {
      if (!window.google || !window.google.maps || !window.google.maps.Geocoder) {
        setGeocodingStatus('Geocoding API not available. Make sure it is enabled in your Google Cloud Console.');
      } else {
        const geocoder = new google.maps.Geocoder();
        geocoder.geocode(
          { address: 'New York' },
          (results, status) => {
            if (status === google.maps.GeocoderStatus.OK && results && results.length > 0) {
              setGeocodingStatus(`✅ Geocoding API working! Found coordinates for "New York"`);
            } else {
              setGeocodingStatus(`❌ Geocoding API error: ${status}`);
            }
          }
        );
      }
    } catch (error) {
      setGeocodingStatus(`❌ Error initializing Geocoding API: ${error instanceof Error ? error.message : String(error)}`);
    }
    
    // Test Directions API
    try {
      if (!window.google || !window.google.maps || !window.google.maps.DirectionsService) {
        setDirectionsStatus('Directions API not available. Make sure it is enabled in your Google Cloud Console.');
      } else {
        const directionsService = new google.maps.DirectionsService();
        directionsService.route(
          {
            origin: { lat: 37.7749, lng: -122.4194 }, // San Francisco
            destination: { lat: 34.0522, lng: -118.2437 }, // Los Angeles
            travelMode: google.maps.TravelMode.DRIVING
          },
          (result, status) => {
            if (status === google.maps.DirectionsStatus.OK && result) {
              setDirectionsStatus(`✅ Directions API working! Found route between San Francisco and Los Angeles`);
            } else {
              setDirectionsStatus(`❌ Directions API error: ${status}`);
            }
            setIsRunningTests(false);
          }
        );
      }
    } catch (error) {
      setDirectionsStatus(`❌ Error initializing Directions API: ${error instanceof Error ? error.message : String(error)}`);
      setIsRunningTests(false);
    }
  };

  useEffect(() => {
    runTests();
  }, [isLoaded, loadError]);

  return (
    <Paper sx={{ p: 3, m: 2 }}>
      <Typography variant="h5" gutterBottom>Google Maps API Test</Typography>
      
      {isRunningTests && (
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <CircularProgress size={24} sx={{ mr: 2 }} />
          <Typography>Running API tests...</Typography>
        </Box>
      )}
      
      <Box sx={{ mt: 2 }}>
        <Typography variant="body1">API Key: {apiKey ? `${apiKey.substring(0, 6)}...${apiKey.substring(apiKey.length - 4)}` : 'Not found'}</Typography>
        <Typography variant="body1">Libraries: {libraries.join(', ')}</Typography>
        <Divider sx={{ my: 2 }} />
        
        <Typography variant="body1" sx={{ mb: 1 }}>Maps API Status: {apiStatus}</Typography>
        <Typography variant="body1" sx={{ mb: 1 }}>Places API Status: {placesStatus}</Typography>
        <Typography variant="body1" sx={{ mb: 1 }}>Geocoding API Status: {geocodingStatus}</Typography>
        <Typography variant="body1" sx={{ mb: 1 }}>Directions API Status: {directionsStatus}</Typography>
      </Box>
      
      <Box sx={{ mt: 3 }}>
        <Button 
          variant="contained" 
          onClick={runTests} 
          disabled={isRunningTests}
          sx={{ mr: 2 }}
        >
          Run Tests Again
        </Button>
        
        <Button 
          variant="outlined" 
          component={Link} 
          href="/api-help"
        >
          View API Help
        </Button>
      </Box>
      
      {(placesStatus.includes('error') || geocodingStatus.includes('error') || directionsStatus.includes('error')) && (
        <Alert severity="warning" sx={{ mt: 3 }}>
          <Typography variant="body2">
            One or more API tests failed. Please visit the 
            <Link href="https://console.cloud.google.com/apis/library" target="_blank" sx={{ mx: 1 }}>
              Google Cloud Console
            </Link>
            to ensure all required APIs are enabled for your API key.
          </Typography>
        </Alert>
      )}
    </Paper>
  );
};

export default ApiTest; 