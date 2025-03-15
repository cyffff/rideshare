import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Grid,
  CircularProgress,
  Alert,
  AlertColor,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Card,
  CardContent,
  CardHeader,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  CheckCircle,
  Error as ErrorIcon,
  ArrowBack,
  Refresh,
  Help,
  LocationOn,
  DirectionsCar,
  Search,
  Info,
} from '@mui/icons-material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useJsApiLoader } from '@react-google-maps/api';

interface ApiTestResult {
  name: string;
  status: 'success' | 'error' | 'loading';
  message: string;
  details?: string;
}

const ApiTest: React.FC = () => {
  const navigate = useNavigate();
  const [results, setResults] = useState<ApiTestResult[]>([]);
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [overallStatus, setOverallStatus] = useState<AlertColor | 'idle'>('idle');
  const [isLoading, setIsLoading] = useState(false);

  const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY || '';
  const libraries = (process.env.REACT_APP_GOOGLE_MAPS_LIBRARIES || 'places').split(',');
  
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: apiKey,
    libraries: libraries as any,
  });

  const runTests = async () => {
    setIsRunningTests(true);
    setIsLoading(true);
    setResults([
      { name: 'API Key Check', status: 'loading', message: 'Checking API key...' },
      { name: 'Maps JavaScript API', status: 'loading', message: 'Testing Maps JavaScript API...' },
      { name: 'Places API', status: 'loading', message: 'Testing Places API...' },
      { name: 'Geocoding API', status: 'loading', message: 'Testing Geocoding API...' },
      { name: 'Directions API', status: 'loading', message: 'Testing Directions API...' },
    ]);

    // Test 1: API Key Check
    let apiKeyResult: ApiTestResult = {
      name: 'API Key Check',
      status: 'loading',
      message: 'Checking API key...',
    };

    if (!apiKey) {
      apiKeyResult = {
        ...apiKeyResult,
        status: 'error',
        message: 'API key is missing',
        details: 'No API key found in environment variables. Make sure REACT_APP_GOOGLE_MAPS_API_KEY is set in your .env file.',
      };
    } else if (apiKey.length < 20) {
      apiKeyResult = {
        ...apiKeyResult,
        status: 'error',
        message: 'API key appears invalid',
        details: `The API key "${apiKey.substring(0, 6)}..." seems too short or malformed.`,
      };
    } else {
      apiKeyResult = {
        ...apiKeyResult,
        status: 'success',
        message: 'API key is present',
        details: `API key "${apiKey.substring(0, 6)}..." is properly formatted.`,
      };
    }

    setResults(prev => prev.map(r => r.name === 'API Key Check' ? apiKeyResult : r));

    // Test 2: Maps JavaScript API
    let mapsApiResult: ApiTestResult = {
      name: 'Maps JavaScript API',
      status: 'loading',
      message: 'Testing Maps JavaScript API...',
    };

    if (loadError) {
      mapsApiResult = {
        ...mapsApiResult,
        status: 'error',
        message: 'Failed to load Maps JavaScript API',
        details: `Error: ${loadError.message}`,
      };
    } else if (isLoaded) {
      mapsApiResult = {
        ...mapsApiResult,
        status: 'success',
        message: 'Maps JavaScript API loaded successfully',
        details: 'The API was loaded and initialized correctly.',
      };
    } else {
      mapsApiResult = {
        ...mapsApiResult,
        status: 'error',
        message: 'Maps JavaScript API failed to load',
        details: 'The API did not load. Check your API key and network connection.',
      };
    }

    setResults(prev => prev.map(r => r.name === 'Maps JavaScript API' ? mapsApiResult : r));

    // Only continue with other tests if Maps JavaScript API loaded successfully
    if (isLoaded) {
      // Test 3: Places API
      let placesApiResult: ApiTestResult = {
        name: 'Places API',
        status: 'loading',
        message: 'Testing Places API...',
      };

      try {
        const autocompleteService = new google.maps.places.AutocompleteService();
        const response = await new Promise<google.maps.places.AutocompletePrediction[]>((resolve, reject) => {
          autocompleteService.getPlacePredictions(
            { input: 'New York' },
            (predictions, status) => {
              if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
                resolve(predictions);
              } else {
                reject(new Error(`Places API error: ${status}`));
              }
            }
          );
        });

        placesApiResult = {
          ...placesApiResult,
          status: 'success',
          message: 'Places API is working',
          details: `Successfully retrieved ${response.length} predictions for "New York".`,
        };
      } catch (err) {
        placesApiResult = {
          ...placesApiResult,
          status: 'error',
          message: 'Places API test failed',
          details: `Error: ${err instanceof Error ? err.message : String(err)}`,
        };
      }

      setResults(prev => prev.map(r => r.name === 'Places API' ? placesApiResult : r));

      // Test 4: Geocoding API
      let geocodingApiResult: ApiTestResult = {
        name: 'Geocoding API',
        status: 'loading',
        message: 'Testing Geocoding API...',
      };

      try {
        const geocoder = new google.maps.Geocoder();
        const response = await new Promise<google.maps.GeocoderResult[]>((resolve, reject) => {
          geocoder.geocode(
            { address: 'New York, NY' },
            (results, status) => {
              if (status === google.maps.GeocoderStatus.OK && results) {
                resolve(results);
              } else {
                reject(new Error(`Geocoding API error: ${status}`));
              }
            }
          );
        });

        geocodingApiResult = {
          ...geocodingApiResult,
          status: 'success',
          message: 'Geocoding API is working',
          details: `Successfully geocoded "New York, NY" to coordinates.`,
        };
      } catch (err) {
        geocodingApiResult = {
          ...geocodingApiResult,
          status: 'error',
          message: 'Geocoding API test failed',
          details: `Error: ${err instanceof Error ? err.message : String(err)}`,
        };
      }

      setResults(prev => prev.map(r => r.name === 'Geocoding API' ? geocodingApiResult : r));

      // Test 5: Directions API
      let directionsApiResult: ApiTestResult = {
        name: 'Directions API',
        status: 'loading',
        message: 'Testing Directions API...',
      };

      try {
        const directionsService = new google.maps.DirectionsService();
        const response = await new Promise<google.maps.DirectionsResult>((resolve, reject) => {
          directionsService.route(
            {
              origin: { lat: 40.7128, lng: -74.006 }, // New York
              destination: { lat: 37.7749, lng: -122.4194 }, // San Francisco
              travelMode: google.maps.TravelMode.DRIVING,
            },
            (result, status) => {
              if (status === google.maps.DirectionsStatus.OK && result) {
                resolve(result);
              } else {
                reject(new Error(`Directions API error: ${status}`));
              }
            }
          );
        });

        directionsApiResult = {
          ...directionsApiResult,
          status: 'success',
          message: 'Directions API is working',
          details: `Successfully retrieved directions between New York and San Francisco.`,
        };
      } catch (err) {
        directionsApiResult = {
          ...directionsApiResult,
          status: 'error',
          message: 'Directions API test failed',
          details: `Error: ${err instanceof Error ? err.message : String(err)}`,
        };
      }

      setResults(prev => prev.map(r => r.name === 'Directions API' ? directionsApiResult : r));
    } else {
      // If Maps JavaScript API failed, mark other tests as failed too
      const errorMessage = 'Cannot test because Maps JavaScript API failed to load';
      setResults(prev => prev.map(r => {
        if (['Places API', 'Geocoding API', 'Directions API'].includes(r.name)) {
          return {
            ...r,
            status: 'error',
            message: errorMessage,
            details: 'Fix the Maps JavaScript API issue first.',
          };
        }
        return r;
      }));
    }

    // Determine overall status
    const finalResults = results.map(r => r.name === 'Maps JavaScript API' ? mapsApiResult : r);
    const hasErrors = finalResults.some(r => r.status === 'error');
    const allSuccess = finalResults.every(r => r.status === 'success');
    
    if (hasErrors) {
      setOverallStatus('error');
    } else if (allSuccess) {
      setOverallStatus('success');
    } else {
      setOverallStatus('warning');
    }

    setIsRunningTests(false);
    setIsLoading(false);
  };

  useEffect(() => {
    runTests();
  }, [isLoaded, loadError]);

  const getStatusIcon = (status: 'success' | 'error' | 'loading') => {
    switch (status) {
      case 'success':
        return <CheckCircle color="success" />;
      case 'error':
        return <ErrorIcon color="error" />;
      case 'loading':
        return <CircularProgress size={20} />;
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, mb: 6 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate(-1)}
          sx={{ mb: 2 }}
        >
          Back
        </Button>

        <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h4" component="h1">
              Google Maps API Diagnostics
            </Typography>
            <Tooltip title="Run tests again">
              <IconButton 
                onClick={runTests} 
                disabled={isRunningTests}
                color="primary"
              >
                <Refresh />
              </IconButton>
            </Tooltip>
          </Box>

          {overallStatus !== 'idle' && (
            <Alert 
              severity={overallStatus} 
              sx={{ mb: 4 }}
              action={
                overallStatus === 'error' && (
                  <Button 
                    color="inherit" 
                    size="small" 
                    component={RouterLink} 
                    to="/api-help"
                  >
                    View Help
                  </Button>
                )
              }
            >
              {overallStatus === 'success' && 'All API tests passed successfully!'}
              {overallStatus === 'error' && 'One or more API tests failed. See details below.'}
              {overallStatus === 'warning' && 'Some tests completed with warnings.'}
              {isLoading && 'Running API tests...'}
            </Alert>
          )}

          <Grid container spacing={3}>
            {results.map((result, index) => (
              <Grid item xs={12} key={result.name}>
                <Card 
                  variant="outlined" 
                  sx={{ 
                    borderColor: 
                      result.status === 'success' ? 'success.light' : 
                      result.status === 'error' ? 'error.light' : 
                      'grey.300'
                  }}
                >
                  <CardHeader
                    avatar={
                      <Box sx={{ display: 'flex', alignItems: 'center', width: 24, height: 24, justifyContent: 'center' }}>
                        {getStatusIcon(result.status)}
                      </Box>
                    }
                    title={result.name}
                    subheader={result.message}
                    action={
                      result.status === 'error' && (
                        <Tooltip title="Get help with this issue">
                          <IconButton 
                            component={RouterLink} 
                            to="/api-help"
                            size="small"
                          >
                            <Help />
                          </IconButton>
                        </Tooltip>
                      )
                    }
                  />
                  {result.details && (
                    <CardContent sx={{ pt: 0 }}>
                      <Typography variant="body2" color="text.secondary">
                        {result.details}
                      </Typography>
                    </CardContent>
                  )}
                </Card>
              </Grid>
            ))}
          </Grid>

          <Divider sx={{ my: 4 }} />

          <Box>
            <Typography variant="h6" gutterBottom>
              API Configuration
            </Typography>
            <List>
              <ListItem>
                <ListItemIcon>
                  <Info />
                </ListItemIcon>
                <ListItemText 
                  primary="API Key" 
                  secondary={apiKey ? `${apiKey.substring(0, 6)}...${apiKey.substring(apiKey.length - 4)}` : 'Not set'} 
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <Info />
                </ListItemIcon>
                <ListItemText 
                  primary="Libraries" 
                  secondary={libraries.join(', ')} 
                />
              </ListItem>
            </List>
          </Box>

          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
            <Button 
              variant="outlined" 
              startIcon={<ArrowBack />}
              onClick={() => navigate('/')}
            >
              Back to Home
            </Button>
            
            <Button 
              variant="contained" 
              color="primary" 
              component={RouterLink} 
              to="/api-help"
              startIcon={<Help />}
            >
              View API Help
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default ApiTest; 