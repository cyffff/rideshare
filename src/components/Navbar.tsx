import React, { useState } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  IconButton, 
  Box, 
  Menu, 
  MenuItem, 
  Divider,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { 
  Menu as MenuIcon, 
  AccountCircle, 
  DirectionsCar, 
  Settings,
  Help
} from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar: React.FC = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [mobileMenuAnchorEl, setMobileMenuAnchorEl] = useState<null | HTMLElement>(null);
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMobileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMobileMenuAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMobileMenuAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleMenuClose();
    navigate('/');
  };

  const menuId = 'primary-search-account-menu';
  const renderMenu = (
    <Menu
      anchorEl={anchorEl}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      id={menuId}
      keepMounted
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      open={Boolean(anchorEl)}
      onClose={handleMenuClose}
    >
      <MenuItem onClick={() => { handleMenuClose(); navigate('/dashboard'); }}>Dashboard</MenuItem>
      <MenuItem onClick={() => { handleMenuClose(); navigate('/book'); }}>Book a Ride</MenuItem>
      <Divider />
      <MenuItem onClick={() => { handleMenuClose(); navigate('/api-test'); }}>API Test</MenuItem>
      <MenuItem onClick={() => { handleMenuClose(); navigate('/api-help'); }}>API Help</MenuItem>
      <Divider />
      <MenuItem onClick={handleLogout}>Logout</MenuItem>
    </Menu>
  );

  const mobileMenuId = 'primary-search-account-menu-mobile';
  const renderMobileMenu = (
    <Menu
      anchorEl={mobileMenuAnchorEl}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      id={mobileMenuId}
      keepMounted
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      open={Boolean(mobileMenuAnchorEl)}
      onClose={handleMenuClose}
    >
      <MenuItem onClick={() => { handleMenuClose(); navigate('/'); }}>
        <IconButton color="inherit">
          <DirectionsCar />
        </IconButton>
        <p>Home</p>
      </MenuItem>
      
      {currentUser ? (
        <>
          <MenuItem onClick={() => { handleMenuClose(); navigate('/dashboard'); }}>
            <IconButton color="inherit">
              <AccountCircle />
            </IconButton>
            <p>Dashboard</p>
          </MenuItem>
          <MenuItem onClick={() => { handleMenuClose(); navigate('/book'); }}>
            <IconButton color="inherit">
              <DirectionsCar />
            </IconButton>
            <p>Book a Ride</p>
          </MenuItem>
          <MenuItem onClick={() => { handleMenuClose(); navigate('/api-test'); }}>
            <IconButton color="inherit">
              <Settings />
            </IconButton>
            <p>API Test</p>
          </MenuItem>
          <MenuItem onClick={() => { handleMenuClose(); navigate('/api-help'); }}>
            <IconButton color="inherit">
              <Help />
            </IconButton>
            <p>API Help</p>
          </MenuItem>
          <Divider />
          <MenuItem onClick={handleLogout}>
            <IconButton color="inherit">
              <AccountCircle />
            </IconButton>
            <p>Logout</p>
          </MenuItem>
        </>
      ) : (
        <>
          <MenuItem onClick={() => { handleMenuClose(); navigate('/login'); }}>
            <IconButton color="inherit">
              <AccountCircle />
            </IconButton>
            <p>Login</p>
          </MenuItem>
          <MenuItem onClick={() => { handleMenuClose(); navigate('/register'); }}>
            <IconButton color="inherit">
              <AccountCircle />
            </IconButton>
            <p>Register</p>
          </MenuItem>
        </>
      )}
    </Menu>
  );

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Typography
            variant="h6"
            noWrap
            component={Link}
            to="/"
            sx={{ 
              display: { xs: 'none', sm: 'block' }, 
              textDecoration: 'none', 
              color: 'inherit',
              flexGrow: 1
            }}
          >
            RideShare
          </Typography>
          
          <Typography
            variant="h6"
            noWrap
            component={Link}
            to="/"
            sx={{ 
              display: { xs: 'block', sm: 'none' }, 
              textDecoration: 'none', 
              color: 'inherit',
              flexGrow: 1
            }}
          >
            RS
          </Typography>
          
          {isMobile ? (
            <IconButton
              edge="end"
              color="inherit"
              aria-label="open drawer"
              aria-controls={mobileMenuId}
              aria-haspopup="true"
              onClick={handleMobileMenuOpen}
            >
              <MenuIcon />
            </IconButton>
          ) : (
            <Box sx={{ display: 'flex' }}>
              <Button color="inherit" component={Link} to="/">
                Home
              </Button>
              
              {currentUser ? (
                <>
                  <Button color="inherit" component={Link} to="/book">
                    Book a Ride
                  </Button>
                  <Button color="inherit" component={Link} to="/dashboard">
                    Dashboard
                  </Button>
                  <IconButton
                    edge="end"
                    aria-label="account of current user"
                    aria-controls={menuId}
                    aria-haspopup="true"
                    onClick={handleProfileMenuOpen}
                    color="inherit"
                  >
                    <AccountCircle />
                  </IconButton>
                </>
              ) : (
                <>
                  <Button color="inherit" component={Link} to="/login">
                    Login
                  </Button>
                  <Button color="inherit" component={Link} to="/register">
                    Register
                  </Button>
                </>
              )}
            </Box>
          )}
        </Toolbar>
      </AppBar>
      {renderMobileMenu}
      {renderMenu}
    </Box>
  );
};

export default Navbar; 