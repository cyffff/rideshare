import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Box, Paper, Typography, Alert, Link, CircularProgress, Button } from '@mui/material';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

// Fix for default marker icons in Leaflet with webpack
// This is needed because webpack doesn't handle Leaflet's assets correctly
// @ts-ignore - _getIconUrl is not in the type definitions but exists at runtime
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

// Custom marker icons
const pickupIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const dropoffIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

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

// Component to update the map view when center prop changes
const ChangeView = ({ center, zoom }: { center: L.LatLngExpression, zoom: number }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
};

// Component to draw a line between pickup and dropoff
const RouteLine = ({ 
  pickupLocation, 
  dropoffLocation 
}: { 
  pickupLocation: { lat: number; lng: number }, 
  dropoffLocation: { lat: number; lng: number } 
}) => {
  const map = useMap();
  
  useEffect(() => {
    if (pickupLocation && dropoffLocation) {
      // Create a polyline between the two points
      const polyline = L.polyline(
        [
          [pickupLocation.lat, pickupLocation.lng],
          [dropoffLocation.lat, dropoffLocation.lng]
        ],
        { color: '#1976d2', weight: 5 }
      ).addTo(map);
      
      // Fit the map to show the entire route
      map.fitBounds(polyline.getBounds(), { padding: [50, 50] });
      
      return () => {
        map.removeLayer(polyline);
      };
    }
  }, [pickupLocation, dropoffLocation, map]);
  
  return null;
};

// Add global CSS to ensure the map container is visible
const mapContainerStyle = `
.leaflet-container {
  width: 100% !important;
  height: 100% !important;
  z-index: 1;
}
`;

// Add a function to inject Leaflet CSS directly into the document head
const injectLeafletCSS = () => {
  const linkId = 'leaflet-css';
  if (!document.getElementById(linkId)) {
    const link = document.createElement('link');
    link.id = linkId;
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.7.1/dist/leaflet.css';
    link.integrity = 'sha512-xodZBNTC5n17Xt2atTPuE1HxjVMSvLVW9ocqUKLsCC5CXdbqCmblAshOMAS6/keqq/sMZMZ19scR4PsZChSR7A==';
    link.crossOrigin = '';
    document.head.appendChild(link);
  }
};

const OpenStreetMap: React.FC<MapProps> = ({
  pickupLocation,
  dropoffLocation,
  showDirections = true,
  height = '400px',
  width = '100%',
  zoom = 12,
  center = defaultCenter
}) => {
  // Inject Leaflet CSS on component mount
  useEffect(() => {
    injectLeafletCSS();
  }, []);

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [mapKey, setMapKey] = useState(Date.now()); // Add a key to force re-render

  // Calculate the center based on pickup and dropoff locations
  const calculateCenter = () => {
    if (pickupLocation && dropoffLocation) {
      return {
        lat: (pickupLocation.lat + dropoffLocation.lat) / 2,
        lng: (pickupLocation.lng + dropoffLocation.lng) / 2
      };
    } else if (pickupLocation) {
      return pickupLocation;
    } else if (dropoffLocation) {
      return dropoffLocation;
    }
    return center;
  };

  const mapCenter = calculateCenter();

  // Force re-render when locations change
  useEffect(() => {
    setMapKey(Date.now());
  }, [pickupLocation, dropoffLocation]);

  return (
    <Box sx={{ position: 'relative', height, width }}>
      {/* Add the global CSS */}
      <style>{mapContainerStyle}</style>
      
      <Paper 
        sx={{ 
          ...containerStyle, 
          height: '100%', 
          width: '100%', 
          overflow: 'hidden',
          position: 'relative', // Ensure proper stacking context
        }}
      >
        <MapContainer 
          key={mapKey}
          style={{ height: '100%', width: '100%', position: 'absolute', top: 0, left: 0 }}
          zoom={zoom}
          center={[mapCenter.lat, mapCenter.lng] as L.LatLngExpression}
          scrollWheelZoom={true}
          zoomControl={true}
        >
          <ChangeView center={[mapCenter.lat, mapCenter.lng] as L.LatLngExpression} zoom={zoom} />
          
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {pickupLocation && (
            <Marker 
              position={[pickupLocation.lat, pickupLocation.lng] as L.LatLngExpression}
              icon={pickupIcon}
            >
              <Popup>Pickup Location</Popup>
            </Marker>
          )}
          
          {dropoffLocation && (
            <Marker 
              position={[dropoffLocation.lat, dropoffLocation.lng] as L.LatLngExpression}
              icon={dropoffIcon}
            >
              <Popup>Dropoff Location</Popup>
            </Marker>
          )}
          
          {pickupLocation && dropoffLocation && showDirections && (
            <RouteLine 
              pickupLocation={pickupLocation} 
              dropoffLocation={dropoffLocation} 
            />
          )}
        </MapContainer>
      </Paper>
      
      {error && (
        <Alert severity="error" sx={{ mt: 1 }}>
          {error}
        </Alert>
      )}
      
      {loading && (
        <Box 
          sx={{ 
            position: 'absolute', 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            backgroundColor: 'rgba(255, 255, 255, 0.7)',
            zIndex: 1000
          }}
        >
          <CircularProgress />
        </Box>
      )}
    </Box>
  );
};

export default OpenStreetMap; 