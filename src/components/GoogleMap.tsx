import React from 'react';
import { GoogleMap, useJsApiLoader, Marker, DirectionsRenderer } from '@react-google-maps/api';
import { Box, Paper, Typography, Alert, Link, CircularProgress, Button } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

// Default center position (can be overridden by props)
const defaultCenter = {
  lat: 37.7749,
  lng: -122.4194 // San Francisco by default
};

// Map container style
const containerStyle = {
  width: '100%',
  height: '400px',
  borderRadius: '8px',
  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)'
};

interface MapProps {
  pickupLocation?: { lat: number; lng: number };
  dropoffLocation?: { lat: number; lng: number };
  showDirections?: boolean;
  height?: string;
  width?: string;
  zoom?: number;
  center?: { lat: number; lng: number };
}

const MapComponent: React.FC<MapProps> = ({
  pickupLocation,
  dropoffLocation,
  showDirections = true,
  height = '400px',
  width = '100%',
  zoom = 12,
  center = defaultCenter
}) => {
  const [directions, setDirections] = React.useState<google.maps.DirectionsResult | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const mapRef = React.useRef<google.maps.Map | null>(null);
  
  const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY || '';
  const isValidApiKey = apiKey && apiKey !== 'your-google-maps-api-key-here';
  
  // Get libraries from env or use default
  const libraries = (process.env.REACT_APP_GOOGLE_MAPS_LIBRARIES || 'places').split(',');

  // Load the Google Maps JavaScript API
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: apiKey,
    libraries: libraries as any
  });

  // Calculate directions when pickup and dropoff locations are provided
  React.useEffect(() => {
    if (isLoaded && pickupLocation && dropoffLocation && showDirections) {
      try {
        if (!window.google || !window.google.maps) {
          setError('Google Maps API not available');
          return;
        }
        
        const directionsService = new google.maps.DirectionsService();
        
        directionsService.route(
          {
            origin: pickupLocation,
            destination: dropoffLocation,
            travelMode: google.maps.TravelMode.DRIVING
          },
          (result, status) => {
            if (status === google.maps.DirectionsStatus.OK) {
              setDirections(result);
              setError(null);
            } else {
              console.error(`Directions request failed: ${status}`);
              setError(`Could not calculate route: ${status}`);
            }
          }
        );
      } catch (err) {
        console.error('Error calculating directions:', err);
        setError(`Error calculating directions: ${err instanceof Error ? err.message : String(err)}`);
      }
    }
  }, [isLoaded, pickupLocation, dropoffLocation, showDirections]);

  // Handle map load
  const onLoad = React.useCallback((map: google.maps.Map) => {
    mapRef.current = map;
  }, []);

  // Handle map unmount
  const onUnmount = React.useCallback(() => {
    mapRef.current = null;
  }, []);

  // Show placeholder if API key is missing or invalid
  if (!isValidApiKey) {
    return (
      <Paper 
        sx={{ 
          ...containerStyle, 
          height, 
          width, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          flexDirection: 'column',
          padding: 2,
          backgroundColor: '#f5f5f5'
        }}
      >
        <Typography variant="h6" color="error" gutterBottom>
          Google Maps API Key Missing
        </Typography>
        <Typography variant="body2" align="center">
          Please add a valid Google Maps API key to your .env file:<br />
          REACT_APP_GOOGLE_MAPS_API_KEY=your-actual-api-key
        </Typography>
        <Typography variant="caption" sx={{ mt: 2, display: 'block', textAlign: 'center' }}>
          Make sure to enable the necessary APIs in the 
          <Link href="https://console.cloud.google.com/apis/library" target="_blank" sx={{ mx: 1 }}>
            Google Cloud Console
          </Link>
        </Typography>
        {(pickupLocation || dropoffLocation) && (
          <Box sx={{ mt: 2, width: '100%' }}>
            {pickupLocation && (
              <Typography variant="body2">
                <strong>Pickup:</strong> {pickupLocation.lat.toFixed(4)}, {pickupLocation.lng.toFixed(4)}
              </Typography>
            )}
            {dropoffLocation && (
              <Typography variant="body2">
                <strong>Dropoff:</strong> {dropoffLocation.lat.toFixed(4)}, {dropoffLocation.lng.toFixed(4)}
              </Typography>
            )}
          </Box>
        )}
      </Paper>
    );
  }

  // Show loading state
  if (loadError) {
    return (
      <Paper 
        elevation={3} 
        sx={{ 
          height, 
          width: '100%', 
          display: 'flex', 
          flexDirection: 'column',
          justifyContent: 'center', 
          alignItems: 'center',
          p: 3,
          backgroundColor: '#fff8e1'
        }}
      >
        <ErrorOutlineIcon color="error" sx={{ fontSize: 48, mb: 2 }} />
        <Typography variant="h6" color="error" gutterBottom align="center">
          Google Maps API Error
        </Typography>
        <Typography variant="body2" align="center" sx={{ mb: 2 }}>
          There was a problem loading the map. Your API key may be invalid or restricted.
        </Typography>
        <Button 
          variant="outlined" 
          color="primary" 
          component={Link} 
          href="/api-help" 
          sx={{ mt: 2 }}
        >
          View API Help
        </Button>
      </Paper>
    );
  }

  return (
    <Box sx={{ position: 'relative' }}>
      {isLoaded ? (
        <GoogleMap
          mapContainerStyle={{ ...containerStyle, height, width }}
          center={center}
          zoom={zoom}
          onLoad={onLoad}
          onUnmount={onUnmount}
          options={{
            zoomControl: true,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: true
          }}
        >
          {/* Render pickup marker if location is provided */}
          {pickupLocation && (
            <Marker
              position={pickupLocation}
              icon={{
                url: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png',
                scaledSize: new google.maps.Size(40, 40)
              }}
              title="Pickup Location"
            />
          )}

          {/* Render dropoff marker if location is provided */}
          {dropoffLocation && (
            <Marker
              position={dropoffLocation}
              icon={{
                url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
                scaledSize: new google.maps.Size(40, 40)
              }}
              title="Dropoff Location"
            />
          )}

          {/* Render directions if available */}
          {directions && showDirections && (
            <DirectionsRenderer
              directions={directions}
              options={{
                suppressMarkers: true,
                polylineOptions: {
                  strokeColor: '#1976d2',
                  strokeWeight: 5
                }
              }}
            />
          )}
        </GoogleMap>
      ) : (
        <Paper 
          sx={{ 
            ...containerStyle, 
            height, 
            width, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            flexDirection: 'column',
            padding: 2,
            backgroundColor: '#f5f5f5'
          }}
        >
          <Typography variant="body1" align="center" gutterBottom>
            Loading map...
          </Typography>
          <CircularProgress size={40} />
        </Paper>
      )}
      {error && (
        <Alert severity="error" sx={{ mt: 1 }}>
          {error}
        </Alert>
      )}
    </Box>
  );
};

export default MapComponent; 