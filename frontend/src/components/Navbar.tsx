import React from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  Box, 
  Menu, 
  MenuItem, 
  IconButton, 
  Container,
  useTheme,
  useMediaQuery,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemButton,
  Divider
} from '@mui/material';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import { 
  AccountCircle, 
  DirectionsCar, 
  History, 
  Dashboard, 
  Login, 
  PersonAdd,
  Menu as MenuIcon,
  Home as HomeIcon,
  Close
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme';

const Navbar = () => {
  const { isAuthenticated, userType, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  
  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleProfile = () => {
    handleClose();
    navigate('/profile');
  };

  const handleLogout = () => {
    handleClose();
    logout();
  };

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    ...(isAuthenticated
      ? [
          { name: 'Book Ride', path: '/book-ride', icon: <DirectionsCar /> },
          { name: 'History', path: '/ride-history', icon: <History /> },
          ...(userType === 'DRIVER'
            ? [{ name: 'Driver Dashboard', path: '/driver-dashboard', icon: <Dashboard /> }]
            : []),
        ]
      : [
          { name: 'Login', path: '/login', icon: <Login /> },
          { name: 'Register', path: '/register', icon: <PersonAdd /> },
        ]),
  ];

  const drawer = (
    <Box
      onClick={handleDrawerToggle}
      sx={{
        textAlign: 'center',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h6" component={RouterLink} to="/" sx={{ textDecoration: 'none', color: 'text.primary' }}>
          RideShare
        </Typography>
        <IconButton edge="end" color="inherit" aria-label="close drawer" onClick={handleDrawerToggle}>
          <Close />
        </IconButton>
      </Box>
      <Divider />
      <List sx={{ flexGrow: 1 }}>
        <ListItemButton component={RouterLink} to="/" selected={isActive('/')}>
          <ListItemIcon>
            <HomeIcon color={isActive('/') ? 'primary' : 'inherit'} />
          </ListItemIcon>
          <ListItemText primary="Home" />
        </ListItemButton>
        {navItems.map((item) => (
          <ListItemButton 
            key={item.name} 
            component={RouterLink} 
            to={item.path}
            selected={isActive(item.path)}
          >
            <ListItemIcon>
              {React.cloneElement(item.icon, {
                color: isActive(item.path) ? 'primary' : 'inherit',
              })}
            </ListItemIcon>
            <ListItemText primary={item.name} />
          </ListItemButton>
        ))}
      </List>
      {isAuthenticated && (
        <>
          <Divider />
          <List>
            <ListItemButton onClick={handleProfile}>
              <ListItemIcon>
                <AccountCircle />
              </ListItemIcon>
              <ListItemText primary="My Profile" />
            </ListItemButton>
            <ListItemButton onClick={handleLogout}>
              <ListItemIcon>
                <AccountCircle />
              </ListItemIcon>
              <ListItemText primary="Logout" />
            </ListItemButton>
          </List>
        </>
      )}
    </Box>
  );

  return (
    <>
      <AppBar 
        position="sticky" 
        elevation={0}
        sx={{ 
          backdropFilter: 'blur(20px)',
          bgcolor: theme.palette.mode === 'light' 
            ? 'rgba(255, 255, 255, 0.8)' 
            : 'rgba(22, 47, 76, 0.8)',
          borderBottom: 1,
          borderColor: 'divider'
        }}
      >
        <Container maxWidth="lg">
          <Toolbar disableGutters>
            {isMobile ? (
              <>
                <IconButton
                  color="inherit"
                  aria-label="open drawer"
                  edge="start"
                  onClick={handleDrawerToggle}
                  sx={{ mr: 2, color: 'text.primary' }}
                >
                  <MenuIcon />
                </IconButton>
                <Typography 
                  variant="h6" 
                  component={RouterLink} 
                  to="/" 
                  sx={{ 
                    flexGrow: 1, 
                    textDecoration: 'none', 
                    color: 'text.primary',
                    fontWeight: 700
                  }}
                >
                  RideShare
                </Typography>
              </>
            ) : (
              <>
                <Typography 
                  variant="h5" 
                  component={RouterLink} 
                  to="/" 
                  sx={{ 
                    mr: 4, 
                    textDecoration: 'none', 
                    color: 'text.primary',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  <DirectionsCar sx={{ mr: 1, color: 'primary.main' }} />
                  RideShare
                </Typography>
                <Box sx={{ flexGrow: 1, display: 'flex' }}>
                  {navItems.map((item) => (
                    <Button
                      key={item.name}
                      component={RouterLink}
                      to={item.path}
                      sx={{
                        mx: 1,
                        my: 2,
                        color: isActive(item.path) ? 'primary.main' : 'text.secondary',
                        display: 'flex',
                        alignItems: 'center',
                        fontWeight: isActive(item.path) ? 700 : 500,
                        '&:hover': {
                          backgroundColor: 'transparent',
                          color: 'primary.main',
                        },
                        position: 'relative',
                        '&::after': isActive(item.path) ? {
                          content: '""',
                          position: 'absolute',
                          bottom: 0,
                          left: 0,
                          width: '100%',
                          height: '3px',
                          backgroundColor: 'primary.main',
                          borderRadius: '4px 4px 0 0'
                        } : {}
                      }}
                    >
                      {React.cloneElement(item.icon, { sx: { mr: 0.5, fontSize: '1.25rem' } })} {item.name}
                    </Button>
                  ))}
                </Box>
                {isAuthenticated && (
                  <Box>
                    <Button
                      onClick={handleMenu}
                      sx={{
                        borderRadius: '24px',
                        border: 1,
                        borderColor: 'divider',
                        py: 0.5,
                        px: 2,
                        boxShadow: theme.palette.mode === 'light' ? '0 2px 6px rgba(0,0,0,0.05)' : 'none',
                        color: 'text.primary',
                        fontSize: '0.875rem',
                        textTransform: 'none',
                        fontWeight: 500,
                        '&:hover': {
                          backgroundColor: 'background.paper',
                          borderColor: 'primary.main',
                        },
                      }}
                      startIcon={<AccountCircle />}
                    >
                      My Account
                    </Button>
                    <Menu
                      id="menu-appbar"
                      anchorEl={anchorEl}
                      anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'right',
                      }}
                      keepMounted
                      transformOrigin={{
                        vertical: 'top',
                        horizontal: 'right',
                      }}
                      open={Boolean(anchorEl)}
                      onClose={handleClose}
                      sx={{
                        '& .MuiPaper-root': {
                          borderRadius: 2,
                          minWidth: '180px',
                          boxShadow: theme.palette.mode === 'light' 
                            ? '0 4px 20px rgba(0,0,0,0.1)' 
                            : '0 4px 20px rgba(0,0,0,0.3)',
                          border: 1,
                          borderColor: 'divider',
                        },
                      }}
                    >
                      <MenuItem onClick={handleProfile} sx={{ py: 1.5 }}>
                        <ListItemIcon>
                          <AccountCircle fontSize="small" />
                        </ListItemIcon>
                        <ListItemText>My Profile</ListItemText>
                      </MenuItem>
                      <Divider />
                      <MenuItem onClick={handleLogout} sx={{ py: 1.5 }}>
                        <ListItemIcon>
                          <AccountCircle fontSize="small" />
                        </ListItemIcon>
                        <ListItemText>Logout</ListItemText>
                      </MenuItem>
                    </Menu>
                  </Box>
                )}
              </>
            )}
          </Toolbar>
        </Container>
      </AppBar>
      
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 280 },
        }}
      >
        {drawer}
      </Drawer>
    </>
  );
};

export default Navbar; 