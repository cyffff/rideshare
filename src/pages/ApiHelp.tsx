import React from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Button,
  Link,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
} from '@mui/material';
import {
  ErrorOutline,
  CheckCircle,
  ArrowBack,
  KeyboardArrowRight,
  ExpandMore,
  Code,
  Settings,
  CreditCard,
  Security,
} from '@mui/icons-material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';

const ApiHelp: React.FC = () => {
  const navigate = useNavigate();
  const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY || '';

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, mb: 6 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate(-1)}
          sx={{ mb: 2 }}
        >
          Back
        </Button>

        <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Google Maps API Help
          </Typography>
          
          <Alert severity="info" sx={{ mb: 4 }}>
            This page will help you troubleshoot issues with the Google Maps API integration.
          </Alert>

          <Typography variant="h5" gutterBottom sx={{ mt: 3 }}>
            Common Issues
          </Typography>

          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography variant="subtitle1" fontWeight="bold">
                <ErrorOutline color="error" sx={{ mr: 1, verticalAlign: 'middle' }} />
                "Places API request denied" Error
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography paragraph>
                This error occurs when your Google Maps API key doesn't have the Places API enabled or has restrictions that prevent it from working properly.
              </Typography>
              <Typography variant="h6" gutterBottom>
                How to fix:
              </Typography>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <KeyboardArrowRight />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Enable the Places API" 
                    secondary="Go to the Google Cloud Console, navigate to 'APIs & Services' > 'Library', search for 'Places API' and enable it."
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <KeyboardArrowRight />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Check API key restrictions" 
                    secondary="Ensure your API key doesn't have overly restrictive settings. Go to 'APIs & Services' > 'Credentials', find your key and check its restrictions."
                  />
                </ListItem>
              </List>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography variant="subtitle1" fontWeight="bold">
                <ErrorOutline color="error" sx={{ mr: 1, verticalAlign: 'middle' }} />
                Map Not Loading or Showing Errors
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography paragraph>
                If the map isn't loading at all or shows errors, it could be due to missing APIs or billing issues.
              </Typography>
              <Typography variant="h6" gutterBottom>
                Required APIs:
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Chip label="Maps JavaScript API" color="primary" sx={{ m: 0.5 }} />
                <Chip label="Places API" color="primary" sx={{ m: 0.5 }} />
                <Chip label="Geocoding API" color="primary" sx={{ m: 0.5 }} />
                <Chip label="Directions API" color="primary" sx={{ m: 0.5 }} />
              </Box>
              <Typography variant="h6" gutterBottom>
                How to fix:
              </Typography>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <KeyboardArrowRight />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Enable all required APIs" 
                    secondary="Go to the Google Cloud Console, navigate to 'APIs & Services' > 'Library', search for each API listed above and enable them all."
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <KeyboardArrowRight />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Set up billing" 
                    secondary="Google Maps Platform requires a billing account. Go to 'Billing' in the Google Cloud Console and ensure you have a valid billing method set up."
                  />
                </ListItem>
              </List>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography variant="subtitle1" fontWeight="bold">
                <ErrorOutline color="warning" sx={{ mr: 1, verticalAlign: 'middle' }} />
                API Key Issues
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography paragraph>
                Problems with your API key configuration can cause various errors.
              </Typography>
              <Typography variant="h6" gutterBottom>
                How to fix:
              </Typography>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <KeyboardArrowRight />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Create a new API key" 
                    secondary="If your current key isn't working, try creating a new one. Go to 'APIs & Services' > 'Credentials' > 'Create Credentials' > 'API Key'."
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <KeyboardArrowRight />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Check domain restrictions" 
                    secondary="If you've restricted your API key to specific domains, make sure the domain you're testing on is included."
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <KeyboardArrowRight />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Update your .env file" 
                    secondary="Make sure your .env file contains the correct API key and libraries configuration."
                  />
                </ListItem>
              </List>
              <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                <Typography variant="subtitle2" gutterBottom>
                  <Code fontSize="small" sx={{ mr: 1 }} />
                  Example .env configuration:
                </Typography>
                <pre style={{ margin: 0, overflow: 'auto' }}>
                  {`REACT_APP_GOOGLE_MAPS_API_KEY=your_api_key_here
REACT_APP_GOOGLE_MAPS_LIBRARIES=places,geocoding,directions`}
                </pre>
              </Box>
            </AccordionDetails>
          </Accordion>

          <Divider sx={{ my: 4 }} />

          <Typography variant="h5" gutterBottom>
            Step-by-Step Guide
          </Typography>

          <Box sx={{ mt: 3 }}>
            <List>
              <ListItem>
                <ListItemIcon>
                  <Settings color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="Step 1: Go to Google Cloud Console" 
                  secondary={
                    <React.Fragment>
                      Visit the{' '}
                      <Link href="https://console.cloud.google.com/" target="_blank" rel="noopener">
                        Google Cloud Console
                      </Link>
                      {' '}and select or create a project.
                    </React.Fragment>
                  }
                />
              </ListItem>
              
              <ListItem>
                <ListItemIcon>
                  <CreditCard color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="Step 2: Set up billing" 
                  secondary="Google Maps Platform requires a billing account. Navigate to 'Billing' and set up a payment method."
                />
              </ListItem>
              
              <ListItem>
                <ListItemIcon>
                  <CheckCircle color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="Step 3: Enable required APIs" 
                  secondary="Go to 'APIs & Services' > 'Library' and enable Maps JavaScript API, Places API, Geocoding API, and Directions API."
                />
              </ListItem>
              
              <ListItem>
                <ListItemIcon>
                  <Security color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="Step 4: Configure your API key" 
                  secondary="Go to 'APIs & Services' > 'Credentials', create or select your API key, and set appropriate restrictions."
                />
              </ListItem>
              
              <ListItem>
                <ListItemIcon>
                  <Code color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="Step 5: Update your application" 
                  secondary="Update your .env file with the new API key and ensure all required libraries are specified."
                />
              </ListItem>
            </List>
          </Box>

          <Divider sx={{ my: 4 }} />

          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
            <Button 
              variant="outlined" 
              component={RouterLink} 
              to="/api-test"
            >
              Run API Diagnostics
            </Button>
            
            <Button 
              variant="contained" 
              color="primary" 
              component={Link} 
              href="https://console.cloud.google.com/google/maps-apis/overview" 
              target="_blank"
            >
              Go to Google Cloud Console
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default ApiHelp; 