import React, { useEffect, useRef, useState } from 'react';
import { Box, CircularProgress, Alert } from '@mui/material';

// Define types for component props
interface GoogleMapProps {
  pickupLocation?: { lat: number; lng: number };
  dropoffLocation?: { lat: number; lng: number };
  currentLocation?: { lat: number; lng: number };
  showDirections?: boolean;
  height?: string;
  onRouteCalculated?: (distance: number, duration: number) => void;
}

// Define Google Maps related types
declare global {
  interface Window {
    google: any;
    initMap: () => void;
  }
}

const GoogleMap: React.FC<GoogleMapProps> = ({
  pickupLocation,
  dropoffLocation,
  currentLocation,
  showDirections = false,
  height = '400px',
  onRouteCalculated
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const [directionsService, setDirectionsService] = useState<any>(null);
  const [directionsRenderer, setDirectionsRenderer] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  // Function to load Google Maps API script
  const loadGoogleMapsApi = () => {
    // For demo purposes, we'll simulate the API already being loaded
    setTimeout(() => {
      initMap();
    }, 1000);
  };

  // Initialize the map
  const initMap = () => {
    try {
      if (!mapRef.current) return;

      // Default to San Francisco if no locations provided
      const defaultLocation = { lat: 37.7749, lng: -122.4194 };
      const initialLocation = currentLocation || pickupLocation || defaultLocation;
      
      // For demo, we're just simulating the map API
      setMap({});

      // Add markers and simulate directions if needed
      if (showDirections && pickupLocation && dropoffLocation && onRouteCalculated) {
        // Calculate a mock distance and duration
        const distance = 5.2; // 5.2 miles
        const duration = 15; // 15 minutes
        onRouteCalculated(distance, duration);
      }

      setLoading(false);
    } catch (err) {
      console.error('Error initializing map:', err);
      setError('Failed to load map. Please try again later.');
      setLoading(false);
    }
  };

  // Load Google Maps API on component mount
  useEffect(() => {
    loadGoogleMapsApi();
    
    return () => {
      // Cleanup function
    };
  }, []);

  return (
    <Box
      sx={{
        position: 'relative',
        height: height,
        width: '100%'
      }}
    >
      {loading && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(255, 255, 255, 0.7)',
            zIndex: 1
          }}
        >
          <CircularProgress />
        </Box>
      )}
      
      {error && (
        <Alert
          severity="error"
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 1,
            width: '80%',
            maxWidth: '400px'
          }}
        >
          {error}
        </Alert>
      )}
      
      <Box
        ref={mapRef}
        sx={{
          height: '100%',
          width: '100%',
          borderRadius: '4px',
          backgroundColor: '#e5e3df',
          backgroundImage: 'url("https://maps.googleapis.com/maps/api/staticmap?center=37.7749,-122.4194&zoom=13&size=600x400&maptype=roadmap&key=DEMO_KEY")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      />
    </Box>
  );
};

export default GoogleMap; 