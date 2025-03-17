import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Paper,
  Grid,
  Avatar,
  Button,
  Divider,
  TextField,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  useTheme
} from '@mui/material';
import { EditOutlined, SaveOutlined, CancelOutlined } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  role: string;
  rating?: number;
  totalRides?: number;
  // Driver specific fields
  driverLicense?: string;
  carModel?: string;
  carColor?: string;
  licensePlate?: string;
}

const Profile: React.FC = () => {
  const theme = useTheme();
  const { userId, userType } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<boolean>(false);
  const [editedProfile, setEditedProfile] = useState<UserProfile | null>(null);
  const [saveLoading, setSaveLoading] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        
        // In a real app, we would fetch from the API
        // const response = await axios.get(`/api/users/${userId}`);
        // setProfile(response.data);
        
        // Mock data for demo
        setTimeout(() => {
          const mockProfile: UserProfile = {
            id: userId || '1',
            name: 'John Doe',
            email: 'john@example.com',
            phoneNumber: '+1 (555) 123-4567',
            role: userType || 'PASSENGER',
            rating: 4.8,
            totalRides: 24,
          };
          
          // Add driver fields if user is a driver
          if (userType === 'DRIVER') {
            mockProfile.driverLicense = 'DL12345678';
            mockProfile.carModel = 'Toyota Camry 2020';
            mockProfile.carColor = 'Silver';
            mockProfile.licensePlate = 'ABC1234';
          }
          
          setProfile(mockProfile);
          setEditedProfile(mockProfile);
          setLoading(false);
        }, 1000);
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError('Failed to load profile. Please try again.');
        setLoading(false);
      }
    };
    
    fetchProfile();
  }, [userId, userType]);
  
  const handleEditToggle = () => {
    if (editing) {
      // Cancel editing
      setEditedProfile(profile);
    }
    setEditing(!editing);
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (editedProfile) {
      setEditedProfile({
        ...editedProfile,
        [name]: value
      });
    }
  };
  
  const handleSave = async () => {
    if (!editedProfile) return;
    
    setSaveLoading(true);
    
    try {
      // In a real app, we would call the API
      // await axios.put(`/api/users/${userId}`, editedProfile);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setProfile(editedProfile);
      setSaveSuccess(true);
      setEditing(false);
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Failed to update profile. Please try again.');
    } finally {
      setSaveLoading(false);
    }
  };
  
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }
  
  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button variant="contained" onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {saveSuccess && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Profile updated successfully!
        </Alert>
      )}
      
      <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
        My Profile
      </Typography>
      
      <Grid container spacing={4}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Box display="flex" flexDirection="column" alignItems="center">
              <Avatar 
                sx={{ 
                  width: 100, 
                  height: 100, 
                  bgcolor: theme.palette.primary.main,
                  fontSize: '2rem',
                  mb: 2
                }}
              >
                {profile?.name.charAt(0)}
              </Avatar>
              
              <Typography variant="h5" fontWeight="bold">
                {profile?.name}
              </Typography>
              
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {profile?.role === 'DRIVER' ? 'Driver' : 'Passenger'}
              </Typography>
              
              {profile?.role === 'DRIVER' && profile?.rating && (
                <Box display="flex" alignItems="center" sx={{ mb: 2 }}>
                  <Typography variant="body1" mr={1}>
                    Rating:
                  </Typography>
                  <Typography variant="body1" fontWeight="bold" color="primary">
                    {profile.rating.toFixed(1)}
                  </Typography>
                  <Typography variant="body1" ml={1}>/ 5.0</Typography>
                </Box>
              )}
              
              <Button
                variant={editing ? "outlined" : "contained"}
                color={editing ? "error" : "primary"}
                startIcon={editing ? <CancelOutlined /> : <EditOutlined />}
                onClick={handleEditToggle}
                sx={{ mt: 2 }}
              >
                {editing ? 'Cancel' : 'Edit Profile'}
              </Button>
              
              {editing && (
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={saveLoading ? <CircularProgress size="1rem" /> : <SaveOutlined />}
                  onClick={handleSave}
                  disabled={saveLoading}
                  sx={{ mt: 2 }}
                >
                  Save Changes
                </Button>
              )}
            </Box>
          </Paper>
          
          {profile?.role === 'DRIVER' && (
            <Card sx={{ mt: 3, borderRadius: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom fontWeight="bold">
                  Driver Stats
                </Typography>
                
                <Divider sx={{ mb: 2 }} />
                
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography variant="body2" color="text.secondary">
                    Total Rides:
                  </Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {profile.totalRides || 0}
                  </Typography>
                </Box>
                
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">
                    Rating:
                  </Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {profile.rating?.toFixed(1) || '0.0'}/5.0
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          )}
        </Grid>
        
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Personal Information
            </Typography>
            
            <Divider sx={{ mb: 3 }} />
            
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Full Name"
                  name="name"
                  value={editing ? editedProfile?.name : profile?.name}
                  onChange={handleChange}
                  disabled={!editing}
                  variant={editing ? "outlined" : "filled"}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email Address"
                  name="email"
                  value={editing ? editedProfile?.email : profile?.email}
                  onChange={handleChange}
                  disabled={!editing}
                  variant={editing ? "outlined" : "filled"}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Phone Number"
                  name="phoneNumber"
                  value={editing ? editedProfile?.phoneNumber : profile?.phoneNumber}
                  onChange={handleChange}
                  disabled={!editing}
                  variant={editing ? "outlined" : "filled"}
                />
              </Grid>
            </Grid>
            
            {profile?.role === 'DRIVER' && (
              <>
                <Typography variant="h6" gutterBottom fontWeight="bold" sx={{ mt: 4 }}>
                  Driver Information
                </Typography>
                
                <Divider sx={{ mb: 3 }} />
                
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Driver License"
                      name="driverLicense"
                      value={editing ? editedProfile?.driverLicense : profile?.driverLicense}
                      onChange={handleChange}
                      disabled={!editing}
                      variant={editing ? "outlined" : "filled"}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="License Plate"
                      name="licensePlate"
                      value={editing ? editedProfile?.licensePlate : profile?.licensePlate}
                      onChange={handleChange}
                      disabled={!editing}
                      variant={editing ? "outlined" : "filled"}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Car Model"
                      name="carModel"
                      value={editing ? editedProfile?.carModel : profile?.carModel}
                      onChange={handleChange}
                      disabled={!editing}
                      variant={editing ? "outlined" : "filled"}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Car Color"
                      name="carColor"
                      value={editing ? editedProfile?.carColor : profile?.carColor}
                      onChange={handleChange}
                      disabled={!editing}
                      variant={editing ? "outlined" : "filled"}
                    />
                  </Grid>
                </Grid>
              </>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Profile; 