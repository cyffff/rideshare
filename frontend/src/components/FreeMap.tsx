import React, { useEffect, useRef, useState } from 'react';
import { Box, CircularProgress, Alert, Typography, useTheme, alpha, Paper, Chip, Fade } from '@mui/material';
import { LocationOn, Navigation, AccessTime } from '@mui/icons-material';
import locationService from '../services/LocationService';

// Define types for component props
interface OSMMapProps {
  pickupLocation?: { lat: number; lng: number };
  dropoffLocation?: { lat: number; lng: number };
  currentLocation?: { lat: number; lng: number };
  showDirections?: boolean;
  height?: string;
  onRouteCalculated?: (distance: number, duration: number) => void;
  onLocationSelect?: (location: { lat: number; lng: number }, isPickup: boolean) => void;
  isSelectingLocation?: boolean;
  selectingPickup?: boolean;
  routePathProp?: Array<{lat: number; lng: number}>;
}

// Define a route point type for waypoints
interface RoutePoint {
  lat: number;
  lng: number;
}

const OSMMap: React.FC<OSMMapProps> = ({
  pickupLocation,
  dropoffLocation,
  currentLocation,
  showDirections = false,
  height = '400px',
  onRouteCalculated,
  onLocationSelect,
  isSelectingLocation = false,
  selectingPickup = true,
  routePathProp
}) => {
  const theme = useTheme();
  const mapRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [mapCenter, setMapCenter] = useState<{lat: number; lng: number}>({
    lat: 24.4539, // Abu Dhabi as default center
    lng: 54.3773
  });
  const [zoom, setZoom] = useState<number>(13);
  const [mapReady, setMapReady] = useState<boolean>(false);
  const [routePath, setRoutePath] = useState<RoutePoint[]>([]);
  const [mapTiles, setMapTiles] = useState<{x: number, y: number, z: number}[]>([]);
  const [distance, setDistance] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);

  // Theme-based colors
  const primaryColor = theme.palette.primary.main;
  const secondaryColor = theme.palette.secondary.main;
  const bgColor = theme.palette.background.paper;
  const textColor = theme.palette.text.primary;
  const isDarkMode = theme.palette.mode === 'dark';

  // Update the useEffect to handle async generateRoutePath
  useEffect(() => {
    if (routePathProp && routePathProp.length > 0) {
      setRoutePath(routePathProp);
      return;
    }

    const generateRoute = async () => {
      if (pickupLocation && dropoffLocation && showDirections) {
        try {
          const result = await generateRoutePath(pickupLocation, dropoffLocation);
          if (result && result.path.length > 0) {
            setRoutePath(result.path);
            
            if (onRouteCalculated) {
              setDistance(result.distance);
              setDuration(result.duration);
              onRouteCalculated(result.distance, result.duration);
            }
          }
        } catch (error) {
          console.error("Error generating route:", error);
          setError("Could not generate route directions");
        }
      } else {
        setRoutePath([]);
      }
    };

    generateRoute();
  }, [pickupLocation, dropoffLocation, showDirections, routePathProp]);

  // Update center and zoom based on locations
  useEffect(() => {
    // Handle map center and zoom level based on locations
    if (pickupLocation && dropoffLocation) {
      // Center the map between pickup and dropoff locations
      const centerLat = (pickupLocation.lat + dropoffLocation.lat) / 2;
      const centerLng = (pickupLocation.lng + dropoffLocation.lng) / 2;
      setMapCenter({ lat: centerLat, lng: centerLng });

      // Calculate zoom level based on distance between points
      const distance = calculateDistance(
        pickupLocation.lat,
        pickupLocation.lng,
        dropoffLocation.lat,
        dropoffLocation.lng
      );
      
      // Adjust zoom level based on distance
      if (distance > 50) {
        setZoom(9);
      } else if (distance > 20) {
        setZoom(10);
      } else if (distance > 10) {
        setZoom(11);
      } else if (distance > 5) {
        setZoom(12);
      } else if (distance > 2) {
        setZoom(13);
      } else {
        setZoom(14);
      }
    } else if (pickupLocation) {
      setMapCenter(pickupLocation);
      setZoom(14);
    } else if (dropoffLocation) {
      setMapCenter(dropoffLocation);
      setZoom(14);
    } else if (currentLocation) {
      setMapCenter(currentLocation);
      setZoom(14);
    }
  }, [pickupLocation, dropoffLocation, currentLocation]);

  // Render map tiles when center or zoom changes
  useEffect(() => {
    if (mapRef.current && mapReady) {
      // Generate the map tiles based on the current center and zoom
      const tileSize = 256;
      const worldSize = tileSize * Math.pow(2, zoom);
      const pixelsPerLngDegree = worldSize / 360;
      const pixelsPerLngRadian = worldSize / (2 * Math.PI);

      // Map bounds
      const mapWidth = mapRef.current.clientWidth;
      const mapHeight = mapRef.current.clientHeight;

      // Calculate tile coordinates
      const centerPixelX = Math.floor(((mapCenter.lng + 180) / 360) * worldSize);
      const centerPixelY = Math.floor((0.5 - Math.log(Math.tan(mapCenter.lat * Math.PI / 180) + 1 / Math.cos(mapCenter.lat * Math.PI / 180)) / (2 * Math.PI)) * worldSize);

      const centerTileX = Math.floor(centerPixelX / tileSize);
      const centerTileY = Math.floor(centerPixelY / tileSize);

      // Calculate visible tiles
      const halfWidthInTiles = Math.ceil(mapWidth / tileSize / 2);
      const halfHeightInTiles = Math.ceil(mapHeight / tileSize / 2);

      const minTileX = Math.max(0, centerTileX - halfWidthInTiles);
      const maxTileX = Math.min(Math.pow(2, zoom) - 1, centerTileX + halfWidthInTiles);
      const minTileY = Math.max(0, centerTileY - halfHeightInTiles);
      const maxTileY = Math.min(Math.pow(2, zoom) - 1, centerTileY + halfHeightInTiles);

      const tiles = [];
      for (let x = minTileX; x <= maxTileX; x++) {
        for (let y = minTileY; y <= maxTileY; y++) {
          tiles.push({ x, y, z: zoom });
        }
      }

      setMapTiles(tiles);
      setLoading(false);
    }
  }, [mapCenter, zoom, mapReady]);

  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isSelectingLocation || !onLocationSelect || !mapRef.current) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Convert pixel coordinates to lat/lng
    const mapWidth = mapRef.current.clientWidth;
    const mapHeight = mapRef.current.clientHeight;

    // Calculate degrees per pixel
    const worldSize = 256 * Math.pow(2, zoom);
    const degreesPerPixelX = 360 / worldSize;
    const degreesPerPixelY = (170 / worldSize) * (mapWidth / mapHeight);

    // Calculate center pixel
    const centerPixelX = mapWidth / 2;
    const centerPixelY = mapHeight / 2;

    // Calculate clicked lat/lng
    const lng = mapCenter.lng + (x - centerPixelX) * degreesPerPixelX;
    const lat = mapCenter.lat - (y - centerPixelY) * degreesPerPixelY;

    onLocationSelect({ lat, lng }, selectingPickup);
  };

  const generateRoutePath = async (start: { lat: number; lng: number }, end: { lat: number; lng: number }) => {
    try {
      // If locationService is available and has getDirections, use it
      if (locationService && typeof locationService.getDirections === 'function') {
        const directions = await locationService.getDirections(
          start, 
          end
        );
        
        if (directions && directions.waypoints && directions.waypoints.length > 0) {
          return {
            path: directions.waypoints,
            distance: directions.distance,
            duration: directions.duration
          };
        }
      }
      
      // Fallback to calculating a simple direct path
      const numPoints = 20;
      const path: RoutePoint[] = [];
      
      for (let i = 0; i <= numPoints; i++) {
        const ratio = i / numPoints;
        const lat = start.lat + ratio * (end.lat - start.lat);
        const lng = start.lng + ratio * (end.lng - start.lng);
        path.push({ lat, lng });
      }
      
      // Calculate direct distance and estimate duration
      const directDistance = calculateDistance(start.lat, start.lng, end.lat, end.lng);
      const estimatedDuration = directDistance * 3 * 60; // Estimate 3 minutes per km
      
      return {
        path,
        distance: directDistance,
        duration: estimatedDuration
      };
    } catch (error) {
      console.error('Error generating route path:', error);
      throw error;
    }
  };

  // Initialize map when component mounts
  useEffect(() => {
    const initMap = async () => {
      try {
        // Set initial location for map
        if (currentLocation) {
          setMapCenter(currentLocation);
        } else if (pickupLocation) {
          setMapCenter(pickupLocation);
        } else if (dropoffLocation) {
          setMapCenter(dropoffLocation);
        }
        
        setMapReady(true);
      } catch (error) {
        console.error("Error initializing map:", error);
        setError("Could not initialize map. Please try again later.");
        setLoading(false);
      }
    };

    initMap();

    // Clean up when component unmounts
    return () => {
      // Any cleanup if needed
    };
  }, []);

  // Calculate distance between two points in kilometers
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Earth's radius in km
    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return distance;
  };

  // Convert degrees to radians
  const toRadians = (degrees: number): number => {
    return degrees * (Math.PI / 180);
  };

  // Get the tile URL
  const getTileUrl = (tile: {x: number, y: number, z: number}) => {
    // Try different tile servers for better reliability
    const servers = ['a', 'b', 'c'];
    const serverIndex = (tile.x + tile.y) % servers.length;
    const server = servers[serverIndex];
    
    return isDarkMode 
      ? `https://cartodb-basemaps-${server}.global.ssl.fastly.net/dark_all/${tile.z}/${tile.x}/${tile.y}.png`
      : `https://${server}.tile.openstreetmap.org/${tile.z}/${tile.x}/${tile.y}.png`;
  };

  // Calculate marker position on the map
  const calculateMarkerPosition = (markerLocation: { lat: number; lng: number }) => {
    if (!mapRef.current) return {};
    
    // Convert lat/lng to pixel coordinates
    const worldSize = 256 * Math.pow(2, zoom);
    const pixelsPerLngDegree = worldSize / 360;
    const pixelsPerLngRadian = worldSize / (2 * Math.PI);
    
    const centerPixelX = ((mapCenter.lng + 180) / 360) * worldSize;
    const centerPixelY = (0.5 - Math.log(Math.tan(mapCenter.lat * Math.PI / 180) + 1 / Math.cos(mapCenter.lat * Math.PI / 180)) / (2 * Math.PI)) * worldSize;
    
    const markerPixelX = ((markerLocation.lng + 180) / 360) * worldSize;
    const markerPixelY = (0.5 - Math.log(Math.tan(markerLocation.lat * Math.PI / 180) + 1 / Math.cos(markerLocation.lat * Math.PI / 180)) / (2 * Math.PI)) * worldSize;
    
    const mapWidth = mapRef.current.clientWidth;
    const mapHeight = mapRef.current.clientHeight;
    
    const x = mapWidth / 2 + (markerPixelX - centerPixelX);
    const y = mapHeight / 2 + (markerPixelY - centerPixelY);
    
    return { x, y };
  };

  // Calculate route point position
  const calculateRoutePointPosition = (point: RoutePoint) => {
    return calculateMarkerPosition(point);
  };

  // Render direction arrow at a specific point along the route
  const renderDirectionArrow = (index: number, total: number) => {
    if (index === 0 || index === total - 1 || !routePath[index] || !routePath[index + 1]) return null;
    
    // Only render arrows at intervals
    if (index % Math.max(1, Math.floor(total / 10)) !== 0) return null;
    
    const currentPoint = routePath[index];
    const nextPoint = routePath[index + 1];
    
    // Calculate angle between points
    const angle = Math.atan2(
      nextPoint.lat - currentPoint.lat,
      nextPoint.lng - currentPoint.lng
    ) * (180 / Math.PI);
    
    const arrowPosition = calculateRoutePointPosition(currentPoint);
    
    return (
      <Box
        key={`arrow-${index}`}
        sx={{
          position: 'absolute',
          left: `${arrowPosition.x}px`,
          top: `${arrowPosition.y}px`,
          width: '16px',
          height: '16px',
          transform: `translate(-50%, -50%) rotate(${angle + 90}deg)`,
          zIndex: 100,
          color: secondaryColor,
        }}
      >
        <Navigation fontSize="small" />
      </Box>
    );
  };

  // Render map and all elements
  return (
    <Box sx={{ position: 'relative', width: '100%', height }}>
      {loading && (
        <Box sx={{ 
          position: 'absolute', 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0, 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          backgroundColor: alpha(bgColor, 0.7),
          zIndex: 1000
        }}>
          <CircularProgress color="primary" />
        </Box>
      )}
      
      {error && (
        <Alert 
          severity="error" 
          sx={{ 
            position: 'absolute', 
            top: 10, 
            left: 10, 
            right: 10, 
            zIndex: 1000,
            boxShadow: 3,
            borderRadius: 2
          }}
        >
          {error}
        </Alert>
      )}
      
      {/* Show instructions if user is selecting location */}
      {isSelectingLocation && (
        <Fade in={isSelectingLocation}>
          <Paper 
            sx={{ 
              position: 'absolute', 
              top: 10, 
              left: 10, 
              right: 10, 
              p: 2, 
              zIndex: 1000,
              borderRadius: 2,
              boxShadow: 3,
              backgroundColor: alpha(bgColor, 0.9),
              backdropFilter: 'blur(10px)',
              border: `1px solid ${alpha(primaryColor, 0.2)}`
            }}
          >
            <Typography variant="body1" fontWeight="medium">
              {selectingPickup ? 'Click on the map to select pickup location' : 'Click on the map to select destination'}
            </Typography>
          </Paper>
        </Fade>
      )}
      
      {/* Show route info if showing directions */}
      {showDirections && distance > 0 && routePath.length > 0 && (
        <Fade in={showDirections && distance > 0}>
          <Paper 
            sx={{ 
              position: 'absolute', 
              bottom: 16, 
              right: 16, 
              p: 2, 
              zIndex: 1000,
              borderRadius: 2,
              boxShadow: 3,
              display: 'flex',
              gap: 2,
              backgroundColor: alpha(bgColor, 0.9),
              backdropFilter: 'blur(10px)',
              border: `1px solid ${alpha(primaryColor, 0.2)}`
            }}
          >
            <Chip 
              icon={<Navigation />} 
              label={`${distance.toFixed(1)} km`} 
              color="primary" 
              variant="filled" 
            />
            <Chip 
              icon={<AccessTime />} 
              label={`${Math.ceil(duration / 60)} min`} 
              color="secondary" 
              variant="filled" 
            />
          </Paper>
        </Fade>
      )}
      
      <Box
        ref={mapRef}
        sx={{
          width: '100%',
          height: '100%',
          bgcolor: isDarkMode ? '#1a1a1a' : '#f0f0f0',
          position: 'relative',
          overflow: 'hidden',
          borderRadius: 2,
          cursor: isSelectingLocation ? 'crosshair' : 'grab',
          '&:active': {
            cursor: isSelectingLocation ? 'crosshair' : 'grabbing'
          },
          boxShadow: 1
        }}
        onClick={handleMapClick}
      >
        {/* Render map tiles */}
        {mapTiles.map((tile) => {
          const tileSize = 256;
          const worldSize = tileSize * Math.pow(2, zoom);
          
          const centerPixelX = ((mapCenter.lng + 180) / 360) * worldSize;
          const centerPixelY = (0.5 - Math.log(Math.tan(mapCenter.lat * Math.PI / 180) + 1 / Math.cos(mapCenter.lat * Math.PI / 180)) / (2 * Math.PI)) * worldSize;
          
          const tilePixelX = tile.x * tileSize;
          const tilePixelY = tile.y * tileSize;
          
          const mapWidth = mapRef.current?.clientWidth || 0;
          const mapHeight = mapRef.current?.clientHeight || 0;
          
          const left = mapWidth / 2 - (centerPixelX - tilePixelX);
          const top = mapHeight / 2 - (centerPixelY - tilePixelY);
          
          return (
            <img
              key={`${tile.z}-${tile.x}-${tile.y}`}
              src={getTileUrl(tile)}
              alt={`Map tile ${tile.z}-${tile.x}-${tile.y}`}
              style={{
                position: 'absolute',
                left: `${left}px`,
                top: `${top}px`,
                width: `${tileSize}px`,
                height: `${tileSize}px`,
                pointerEvents: 'none',
                userSelect: 'none',
                opacity: 0.9,
                transition: 'opacity 0.2s'
              }}
              onLoad={() => {
                // Once tiles start loading, the map is considered ready
                if (!mapReady) setMapReady(true);
              }}
            />
          );
        })}
        
        {/* Render route path */}
        {routePath.length > 0 && showDirections && (
          <>
            {/* Render route line */}
            {routePath.map((point, index) => {
              if (index === 0) return null;
              
              const startPoint = routePath[index - 1];
              const endPoint = point;
              
              const startPos = calculateRoutePointPosition(startPoint);
              const endPos = calculateRoutePointPosition(endPoint);
              
              // Only render if both points are within view
              if (!startPos.x || !startPos.y || !endPos.x || !endPos.y) return null;
              
              // Calculate line length and angle
              const dx = endPos.x - startPos.x;
              const dy = endPos.y - startPos.y;
              const length = Math.sqrt(dx * dx + dy * dy);
              const angle = Math.atan2(dy, dx) * (180 / Math.PI);
              
              return (
                <Box
                  key={`route-${index}`}
                  sx={{
                    position: 'absolute',
                    left: `${startPos.x}px`,
                    top: `${startPos.y}px`,
                    width: `${length}px`,
                    height: '4px',
                    bgcolor: secondaryColor,
                    boxShadow: `0 0 5px ${alpha(secondaryColor, 0.5)}`,
                    transformOrigin: '0 50%',
                    transform: `rotate(${angle}deg)`,
                    zIndex: 50,
                    borderRadius: '2px',
                    opacity: 0.8
                  }}
                />
              );
            })}
            
            {/* Render direction arrows */}
            {routePath.map((_, index) => renderDirectionArrow(index, routePath.length))}
          </>
        )}
        
        {/* Render pickup location marker */}
        {pickupLocation && (
          <Box
            sx={{
              position: 'absolute',
              ...calculateMarkerPosition(pickupLocation),
              transform: 'translate(-50%, -100%)',
              zIndex: 200,
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
              animation: 'pulse 2s infinite'
            }}
          >
            <Box
              sx={{
                width: '30px',
                height: '30px',
                borderRadius: '50% 50% 50% 0',
                bgcolor: theme.palette.primary.main,
                transform: 'rotate(-45deg)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                '&::after': {
                  content: '""',
                  width: '15px',
                  height: '15px',
                  borderRadius: '50%',
                  bgcolor: 'white',
                }
              }}
            />
            <Typography 
              variant="caption" 
              sx={{ 
                position: 'absolute', 
                top: '32px', 
                left: '50%', 
                transform: 'translateX(-50%)', 
                whiteSpace: 'nowrap',
                bgcolor: alpha(bgColor, 0.7),
                px: 1,
                py: 0.5,
                borderRadius: 1,
                fontWeight: 'bold',
                boxShadow: 1
              }}
            >
              Pickup
            </Typography>
          </Box>
        )}
        
        {/* Render dropoff location marker */}
        {dropoffLocation && (
          <Box
            sx={{
              position: 'absolute',
              ...calculateMarkerPosition(dropoffLocation),
              transform: 'translate(-50%, -100%)',
              zIndex: 200,
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
              animation: 'pulse 2s infinite'
            }}
          >
            <Box
              sx={{
                width: '30px',
                height: '30px',
                borderRadius: '50% 50% 50% 0',
                bgcolor: theme.palette.secondary.main,
                transform: 'rotate(-45deg)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                '&::after': {
                  content: '""',
                  width: '15px',
                  height: '15px',
                  borderRadius: '50%',
                  bgcolor: 'white',
                }
              }}
            />
            <Typography 
              variant="caption" 
              sx={{ 
                position: 'absolute', 
                top: '32px', 
                left: '50%', 
                transform: 'translateX(-50%)', 
                whiteSpace: 'nowrap',
                bgcolor: alpha(bgColor, 0.7),
                px: 1,
                py: 0.5,
                borderRadius: 1,
                fontWeight: 'bold',
                boxShadow: 1
              }}
            >
              Destination
            </Typography>
          </Box>
        )}
        
        {/* Render current location marker */}
        {currentLocation && (
          <Box
            sx={{
              position: 'absolute',
              ...calculateMarkerPosition(currentLocation),
              transform: 'translate(-50%, -50%)',
              zIndex: 150
            }}
          >
            <Box
              sx={{
                width: '16px',
                height: '16px',
                borderRadius: '50%',
                bgcolor: theme.palette.info.main,
                border: '3px solid white',
                boxShadow: '0 0 0 2px rgba(0,0,0,0.2), 0 0 10px rgba(0,0,0,0.3)',
                animation: 'pulse 2s infinite'
              }}
            />
          </Box>
        )}
      </Box>
      
      {/* CSS for animations */}
      <style>
        {`
          @keyframes pulse {
            0% {
              transform: translate(-50%, -100%) scale(1);
            }
            50% {
              transform: translate(-50%, -100%) scale(1.05);
            }
            100% {
              transform: translate(-50%, -100%) scale(1);
            }
          }
        `}
      </style>
    </Box>
  );
};

export default OSMMap; 