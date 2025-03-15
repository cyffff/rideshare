import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Alert,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Card,
  CardContent,
  CardActions,
} from '@mui/material';
import MapIcon from '@mui/icons-material/Map';
import GoogleMap from '../components/GoogleMap';

interface Ride {
  id: number;
  pickupLocation: string;
  dropoffLocation: string;
  rideTime: string;
  price: number;
  status: string;
  driver: {
    fullName: string;
  };
  pickupCoordinates?: {
    lat: number;
    lng: number;
  };
  dropoffCoordinates?: {
    lat: number;
    lng: number;
  };
}

const RideHistory = () => {
  const [rides, setRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedRide, setSelectedRide] = useState<Ride | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  useEffect(() => {
    const fetchRides = async () => {
      try {
        const response = await fetch('/api/rides', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch rides');
        }

        const data = await response.json();
        
        // For demo purposes, add mock coordinates if they don't exist
        const ridesWithCoordinates = data.map((ride: Ride) => ({
          ...ride,
          pickupCoordinates: ride.pickupCoordinates || { 
            lat: 37.7749 + (Math.random() * 0.1 - 0.05), 
            lng: -122.4194 + (Math.random() * 0.1 - 0.05) 
          },
          dropoffCoordinates: ride.dropoffCoordinates || { 
            lat: 37.7749 + (Math.random() * 0.1 - 0.05), 
            lng: -122.4194 + (Math.random() * 0.1 - 0.05) 
          }
        }));
        
        setRides(ridesWithCoordinates);
      } catch (err) {
        setError('Failed to load ride history');
      } finally {
        setLoading(false);
      }
    };

    fetchRides();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'success';
      case 'IN_PROGRESS':
        return 'info';
      case 'CANCELLED':
        return 'error';
      case 'ACCEPTED':
        return 'primary';
      case 'PENDING':
        return 'warning';
      default:
        return 'default';
    }
  };

  const handleOpenMap = (ride: Ride) => {
    setSelectedRide(ride);
  };

  const handleCloseMap = () => {
    setSelectedRide(null);
  };

  const toggleViewMode = () => {
    setViewMode(viewMode === 'table' ? 'cards' : 'table');
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 8, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            Ride History
          </Typography>
          <Button 
            variant="outlined" 
            onClick={toggleViewMode}
          >
            {viewMode === 'table' ? 'Card View' : 'Table View'}
          </Button>
        </Box>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        {viewMode === 'table' ? (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Pickup</TableCell>
                  <TableCell>Dropoff</TableCell>
                  <TableCell>Driver</TableCell>
                  <TableCell>Price</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Map</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rides.map((ride) => (
                  <TableRow key={ride.id}>
                    <TableCell>
                      {new Date(ride.rideTime).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{ride.pickupLocation}</TableCell>
                    <TableCell>{ride.dropoffLocation}</TableCell>
                    <TableCell>{ride.driver?.fullName || 'Not assigned'}</TableCell>
                    <TableCell>${ride.price.toFixed(2)}</TableCell>
                    <TableCell>
                      <Chip
                        label={ride.status}
                        color={getStatusColor(ride.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Button 
                        size="small" 
                        startIcon={<MapIcon />} 
                        onClick={() => handleOpenMap(ride)}
                      >
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Grid container spacing={3}>
            {rides.map((ride) => (
              <Grid item xs={12} sm={6} md={4} key={ride.id}>
                <Card>
                  <Box sx={{ height: '200px', position: 'relative' }}>
                    <GoogleMap
                      pickupLocation={ride.pickupCoordinates}
                      dropoffLocation={ride.dropoffCoordinates}
                      showDirections={true}
                      height="200px"
                    />
                  </Box>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {new Date(ride.rideTime).toLocaleDateString()} at {new Date(ride.rideTime).toLocaleTimeString()}
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        From: {ride.pickupLocation}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        To: {ride.dropoffLocation}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body1" fontWeight="bold">
                        ${ride.price.toFixed(2)}
                      </Typography>
                      <Chip
                        label={ride.status}
                        color={getStatusColor(ride.status) as any}
                        size="small"
                      />
                    </Box>
                  </CardContent>
                  <CardActions>
                    <Button 
                      size="small" 
                      startIcon={<MapIcon />} 
                      onClick={() => handleOpenMap(ride)}
                    >
                      View Full Map
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
        
        {/* Map Dialog */}
        <Dialog 
          open={!!selectedRide} 
          onClose={handleCloseMap}
          maxWidth="md"
          fullWidth
        >
          {selectedRide && (
            <>
              <DialogTitle>
                Ride Details - {new Date(selectedRide.rideTime).toLocaleDateString()}
              </DialogTitle>
              <DialogContent>
                <Box sx={{ height: '400px', mb: 2 }}>
                  <GoogleMap
                    pickupLocation={selectedRide.pickupCoordinates}
                    dropoffLocation={selectedRide.dropoffCoordinates}
                    showDirections={true}
                    height="400px"
                  />
                </Box>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle1">Pickup Location:</Typography>
                    <Typography variant="body1" gutterBottom>{selectedRide.pickupLocation}</Typography>
                    
                    <Typography variant="subtitle1">Dropoff Location:</Typography>
                    <Typography variant="body1" gutterBottom>{selectedRide.dropoffLocation}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle1">Date & Time:</Typography>
                    <Typography variant="body1" gutterBottom>
                      {new Date(selectedRide.rideTime).toLocaleString()}
                    </Typography>
                    
                    <Typography variant="subtitle1">Driver:</Typography>
                    <Typography variant="body1" gutterBottom>
                      {selectedRide.driver?.fullName || 'Not assigned'}
                    </Typography>
                    
                    <Typography variant="subtitle1">Price:</Typography>
                    <Typography variant="body1" gutterBottom>${selectedRide.price.toFixed(2)}</Typography>
                    
                    <Typography variant="subtitle1">Status:</Typography>
                    <Chip
                      label={selectedRide.status}
                      color={getStatusColor(selectedRide.status) as any}
                    />
                  </Grid>
                </Grid>
              </DialogContent>
              <DialogActions>
                <Button onClick={handleCloseMap}>Close</Button>
              </DialogActions>
            </>
          )}
        </Dialog>
      </Box>
    </Container>
  );
};

export default RideHistory; 