import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Link,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Stepper,
  Step,
  StepLabel,
  Grid,
  Divider,
  CircularProgress,
  InputAdornment,
  IconButton,
} from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { 
  Person, 
  Email, 
  Phone, 
  Lock, 
  Visibility, 
  VisibilityOff,
  DirectionsCar,
  ArrowForward,
  ArrowBack
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    phoneNumber: '',
    role: 'PASSENGER',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const { register, error, loading, currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // If user is already logged in, redirect to home
    if (currentUser) {
      navigate('/');
    }
  }, [currentUser, navigate]);

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    
    // Clear validation error when field is edited
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSelectChange = (e: SelectChangeEvent) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const validateStep = (step: number): boolean => {
    const errors: Record<string, string> = {};
    
    if (step === 0) {
      if (!formData.name.trim()) {
        errors.name = 'Name is required';
      }
      
      if (!formData.email.trim()) {
        errors.email = 'Email is required';
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        errors.email = 'Email is invalid';
      }
      
      if (!formData.phoneNumber.trim()) {
        errors.phoneNumber = 'Phone number is required';
      }
    } else if (step === 1) {
      if (!formData.password) {
        errors.password = 'Password is required';
      } else if (formData.password.length < 6) {
        errors.password = 'Password must be at least 6 characters';
      }
      
      if (!formData.confirmPassword) {
        errors.confirmPassword = 'Please confirm your password';
      } else if (formData.password !== formData.confirmPassword) {
        errors.confirmPassword = 'Passwords do not match';
      }
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep((prevStep) => prevStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateStep(activeStep)) {
      return;
    }
    
    await register(formData.name, formData.email, formData.password);
  };

  const steps = ['Personal Information', 'Account Security', 'Account Type'];

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <>
            <TextField
              fullWidth
              label="Full Name"
              name="name"
              value={formData.name}
              onChange={handleTextChange}
              margin="normal"
              required
              error={!!validationErrors.name}
              helperText={validationErrors.name}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Person color="action" />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleTextChange}
              margin="normal"
              required
              error={!!validationErrors.email}
              helperText={validationErrors.email}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email color="action" />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              fullWidth
              label="Phone Number"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleTextChange}
              margin="normal"
              required
              error={!!validationErrors.phoneNumber}
              helperText={validationErrors.phoneNumber}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Phone color="action" />
                  </InputAdornment>
                ),
              }}
            />
          </>
        );
      case 1:
        return (
          <>
            <TextField
              fullWidth
              label="Password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleTextChange}
              margin="normal"
              required
              error={!!validationErrors.password}
              helperText={validationErrors.password}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={toggleShowPassword}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              fullWidth
              label="Confirm Password"
              name="confirmPassword"
              type={showPassword ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={handleTextChange}
              margin="normal"
              required
              error={!!validationErrors.confirmPassword}
              helperText={validationErrors.confirmPassword}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock color="action" />
                  </InputAdornment>
                ),
              }}
            />
          </>
        );
      case 2:
        return (
          <>
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                How will you use RideShare?
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Select your primary role on the platform
              </Typography>
            </Box>
            
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Paper
                  elevation={formData.role === 'PASSENGER' ? 3 : 1}
                  sx={{
                    p: 3,
                    textAlign: 'center',
                    cursor: 'pointer',
                    border: formData.role === 'PASSENGER' ? '2px solid' : '1px solid',
                    borderColor: formData.role === 'PASSENGER' ? 'primary.main' : 'divider',
                    '&:hover': { borderColor: 'primary.main' },
                  }}
                  onClick={() => setFormData(prev => ({ ...prev, role: 'PASSENGER' }))}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                    <Person sx={{ fontSize: 60, color: 'primary.main' }} />
                  </Box>
                  <Typography variant="h6" gutterBottom>
                    Passenger
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Book rides and travel to your destinations
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Paper
                  elevation={formData.role === 'DRIVER' ? 3 : 1}
                  sx={{
                    p: 3,
                    textAlign: 'center',
                    cursor: 'pointer',
                    border: formData.role === 'DRIVER' ? '2px solid' : '1px solid',
                    borderColor: formData.role === 'DRIVER' ? 'primary.main' : 'divider',
                    '&:hover': { borderColor: 'primary.main' },
                  }}
                  onClick={() => setFormData(prev => ({ ...prev, role: 'DRIVER' }))}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                    <DirectionsCar sx={{ fontSize: 60, color: 'primary.main' }} />
                  </Box>
                  <Typography variant="h6" gutterBottom>
                    Driver
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Provide rides and earn money on your schedule
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 8, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
          <Typography variant="h4" component="h1" align="center" gutterBottom fontWeight="bold">
            Create Your Account
          </Typography>
          <Typography variant="body1" align="center" color="text.secondary" sx={{ mb: 4 }}>
            Join RideShare and start your journey with us
          </Typography>
          
          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
          
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}
          
          <form onSubmit={handleSubmit}>
            {renderStepContent(activeStep)}
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
              <Button
                disabled={activeStep === 0}
                onClick={handleBack}
                startIcon={<ArrowBack />}
              >
                Back
              </Button>
              
              {activeStep === steps.length - 1 ? (
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={loading}
                  sx={{ position: 'relative' }}
                >
                  {loading ? (
                    <CircularProgress 
                      size={24} 
                      sx={{ 
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        marginTop: '-12px',
                        marginLeft: '-12px',
                      }} 
                    />
                  ) : (
                    'Create Account'
                  )}
                </Button>
              ) : (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleNext}
                  endIcon={<ArrowForward />}
                >
                  Next
                </Button>
              )}
            </Box>
          </form>
          
          <Divider sx={{ my: 4 }} />
          
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body1">
              Already have an account?{' '}
              <Link component={RouterLink} to="/login" underline="hover">
                Sign in here
              </Link>
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Register; 