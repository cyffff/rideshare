import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline, IconButton, Box } from '@mui/material';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import BookRide from './pages/BookRide';
import RideHistory from './pages/RideHistory';
import DriverDashboard from './pages/DriverDashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import { AuthProvider, useAuth } from './context/AuthContext';
import theme, { getTheme } from './theme';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';

// Protected route component
interface ProtectedRouteProps {
  element: React.ReactNode;
  requiredRole?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ element, requiredRole }) => {
  const { isAuthenticated, userType } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  // If role is required, check if user has that role
  if (requiredRole && userType !== requiredRole) {
    return <Navigate to="/" replace />;
  }
  
  return <>{element}</>;
};

function AppWithRoutes() {
  const [mode, setMode] = useState<'light' | 'dark'>('light');
  
  const toggleColorMode = () => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeProvider theme={getTheme(mode)}>
      <CssBaseline />
      <Router>
        <AuthProvider>
          <Box sx={{ 
            position: 'fixed', 
            bottom: 16, 
            right: 16, 
            zIndex: 1000,
            backgroundColor: 'background.paper',
            borderRadius: '50%',
            boxShadow: 3
          }}>
            <IconButton onClick={toggleColorMode} color="primary">
              {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>
          </Box>
          <AppContent />
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

function AppContent() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/book-ride" element={<ProtectedRoute element={<BookRide />} />} />
        <Route path="/ride-history" element={<ProtectedRoute element={<RideHistory />} />} />
        <Route path="/driver-dashboard" element={<ProtectedRoute element={<DriverDashboard />} requiredRole="DRIVER" />} />
        <Route path="/profile" element={<ProtectedRoute element={<Profile />} />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </>
  );
}

function App() {
  return <AppWithRoutes />;
}

export default App;
