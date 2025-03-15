import React from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText,
  Link,
  Divider
} from '@mui/material';
import KeyIcon from '@mui/icons-material/Key';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import CodeIcon from '@mui/icons-material/Code';

const ApiKeyHelper: React.FC = () => {
  const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY || '';
  
  return (
    <Paper sx={{ p: 3, m: 2 }}>
      <Typography variant="h5" gutterBottom>Google Maps API Key Setup Guide</Typography>
      
      <Box sx={{ mt: 2, mb: 3 }}>
        <Typography variant="body1" paragraph>
          Your application is experiencing issues with the Google Maps API. Follow these steps to fix it:
        </Typography>
      </Box>
      
      <List>
        <ListItem>
          <ListItemIcon>
            <KeyIcon color="primary" />
          </ListItemIcon>
          <ListItemText 
            primary="Current API Key Status" 
            secondary={
              apiKey 
                ? `Using API key: ${apiKey.substring(0, 6)}...${apiKey.substring(apiKey.length - 4)}` 
                : "No API key found"
            } 
          />
        </ListItem>
        
        <Divider sx={{ my: 2 }} />
        
        <Typography variant="h6" gutterBottom>Steps to Fix:</Typography>
        
        <ListItem>
          <ListItemIcon>
            <CheckCircleIcon color="primary" />
          </ListItemIcon>
          <ListItemText 
            primary="1. Go to Google Cloud Console" 
            secondary={
              <Link href="https://console.cloud.google.com/apis/credentials" target="_blank">
                https://console.cloud.google.com/apis/credentials
              </Link>
            }
          />
        </ListItem>
        
        <ListItem>
          <ListItemIcon>
            <CheckCircleIcon color="primary" />
          </ListItemIcon>
          <ListItemText 
            primary="2. Enable the following APIs for your project:" 
            secondary={
              <Box component="span" sx={{ display: 'block', mt: 1 }}>
                • Maps JavaScript API<br />
                • Places API<br />
                • Geocoding API<br />
                • Directions API
              </Box>
            }
          />
        </ListItem>
        
        <ListItem>
          <ListItemIcon>
            <CheckCircleIcon color="primary" />
          </ListItemIcon>
          <ListItemText 
            primary="3. Check API key restrictions" 
            secondary="Make sure your API key has no restrictions or has the correct domain restrictions for your development environment (e.g., localhost)"
          />
        </ListItem>
        
        <ListItem>
          <ListItemIcon>
            <CheckCircleIcon color="primary" />
          </ListItemIcon>
          <ListItemText 
            primary="4. Verify billing is enabled" 
            secondary="Google Maps Platform requires a billing account, even for the free tier usage"
          />
        </ListItem>
        
        <ListItem>
          <ListItemIcon>
            <CodeIcon color="primary" />
          </ListItemIcon>
          <ListItemText 
            primary="5. Update your .env file" 
            secondary={
              <Box component="pre" sx={{ 
                backgroundColor: '#f5f5f5', 
                p: 1, 
                borderRadius: 1,
                overflowX: 'auto',
                fontSize: '0.85rem'
              }}>
                REACT_APP_GOOGLE_MAPS_API_KEY=your-api-key-here<br />
                REACT_APP_GOOGLE_MAPS_LIBRARIES=places,geocoding,directions
              </Box>
            }
          />
        </ListItem>
        
        <ListItem>
          <ListItemIcon>
            <ErrorIcon color="error" />
          </ListItemIcon>
          <ListItemText 
            primary="Common Errors" 
            secondary={
              <Box component="span" sx={{ display: 'block', mt: 1 }}>
                • REQUEST_DENIED: API key is invalid or doesn't have the required APIs enabled<br />
                • OVER_QUERY_LIMIT: You've exceeded your quota<br />
                • UNKNOWN_ERROR: Server error, try again later
              </Box>
            }
          />
        </ListItem>
      </List>
      
      <Box sx={{ mt: 3, p: 2, backgroundColor: '#f9f9f9', borderRadius: 1 }}>
        <Typography variant="subtitle2" color="text.secondary">
          Note: After making changes to your API key configuration, you may need to wait a few minutes for the changes to take effect, and then restart your application.
        </Typography>
      </Box>
    </Paper>
  );
};

export default ApiKeyHelper; 