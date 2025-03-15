import React, { useState, useEffect, useRef } from 'react';
import { TextField, Autocomplete, Box, CircularProgress, Alert, Typography, Link } from '@mui/material';
import { useJsApiLoader } from '@react-google-maps/api';

interface LocationSearchProps {
  label: string;
  placeholder?: string;
  value: string;
  onChange: (value: string, coordinates?: { lat: number; lng: number }) => void;
  required?: boolean;
  disabled?: boolean;
  mapType?: 'google' | 'openstreetmap';
}

// Function to search locations using OpenStreetMap's Nominatim service
const searchWithNominatim = async (query: string): Promise<Array<{description: string, place_id: string, lat: number, lng: number}>> => {
  if (!query || query.length < 3) return [];
  
  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`);
    
    if (!response.ok) {
      throw new Error(`Nominatim API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    return data.map((item: any) => ({
      description: item.display_name,
      place_id: item.place_id.toString(),
      lat: parseFloat(item.lat),
      lng: parseFloat(item.lon)
    }));
  } catch (error) {
    console.error('Error searching with Nominatim:', error);
    return [];
  }
};

const LocationSearch: React.FC<LocationSearchProps> = ({
  label,
  placeholder,
  value,
  onChange,
  required = false,
  disabled = false,
  mapType = 'google'
}) => {
  const [inputValue, setInputValue] = useState(value);
  const [options, setOptions] = useState<Array<{description: string, place_id: string, lat?: number, lng?: number}>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiLoaded, setApiLoaded] = useState(false);
  
  const autocompleteService = useRef<google.maps.places.AutocompleteService | null>(null);
  const placesService = useRef<google.maps.places.PlacesService | null>(null);
  const dummyElement = useRef<HTMLDivElement | null>(null);

  const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY || '';
  const isValidApiKey = apiKey && apiKey !== 'your-google-maps-api-key-here';
  
  // Get libraries from env or use default
  const libraries = (process.env.REACT_APP_GOOGLE_MAPS_LIBRARIES || 'places').split(',');

  // Load the Google Maps JavaScript API
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: apiKey,
    libraries: libraries as any
  });

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  useEffect(() => {
    if (mapType === 'openstreetmap') {
      setApiLoaded(true);
      setError(null);
      return;
    }
    
    if (!window.google) {
      console.error('Google Maps API not loaded');
      setError('Google Maps API not loaded. Please check your API key.');
      return;
    }

    try {
      if (window.google.maps.places) {
        autocompleteService.current = new window.google.maps.places.AutocompleteService();
        
        // Create a dummy element for PlacesService (it requires a DOM element)
        if (!dummyElement.current) {
          dummyElement.current = document.createElement('div');
        }
        
        placesService.current = new window.google.maps.places.PlacesService(dummyElement.current);
        setApiLoaded(true);
        setError(null);
      } else {
        console.error('Google Maps Places API not available');
        setError('Google Maps Places API not available. Please enable it in your Google Cloud Console.');
      }
    } catch (err) {
      console.error('Error initializing Google Maps services:', err);
      setError(`Error initializing location search: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  }, [mapType]);

  const fetchPlacePredictions = async (input: string) => {
    if (!input || input.length < 3) {
      setOptions([]);
      return;
    }

    setLoading(true);
    
    try {
      setError(null);
      
      // Use OpenStreetMap's Nominatim service if mapType is openstreetmap or Google Maps API is not available
      if (mapType === 'openstreetmap' || !isValidApiKey || !autocompleteService.current) {
        const results = await searchWithNominatim(input);
        setOptions(results);
        setLoading(false);
        return;
      }
      
      // Otherwise use Google Maps Places API
      const results = await new Promise<google.maps.places.AutocompletePrediction[]>((resolve, reject) => {
        autocompleteService.current!.getPlacePredictions(
          { input },
          (predictions, status) => {
            if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
              resolve(predictions);
            } else {
              console.error('Autocomplete prediction error:', status);
              if (status === google.maps.places.PlacesServiceStatus.REQUEST_DENIED) {
                reject(new Error('Places API request denied. Your API key may not have the Places API enabled or has restrictions.'));
              } else {
                reject(new Error(`Failed to get predictions: ${status}`));
              }
            }
          }
        );
      });

      setOptions(results.map(prediction => ({
        description: prediction.description,
        place_id: prediction.place_id
      })));
    } catch (err) {
      console.error('Error fetching place predictions:', err);
      setError(`${err instanceof Error ? err.message : 'Error fetching locations'}`);
      setOptions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (event: React.SyntheticEvent, newInputValue: string) => {
    setInputValue(newInputValue);
    
    // Only fetch predictions if the input has changed significantly
    if (newInputValue.length > 2 && newInputValue !== value) {
      fetchPlacePredictions(newInputValue);
    }
  };

  const handleChange = (event: React.SyntheticEvent, newValue: string | { description: string; place_id: string; lat?: number; lng?: number } | null) => {
    if (!newValue) {
      onChange('');
      return;
    }

    const selectedValue = typeof newValue === 'string' ? newValue : newValue.description;
    
    // If we have direct coordinates from Nominatim
    if (typeof newValue !== 'string' && newValue.lat && newValue.lng) {
      onChange(selectedValue, { lat: newValue.lat, lng: newValue.lng });
      return;
    }
    
    // For Google Maps, get coordinates using Places API
    const placeId = typeof newValue !== 'string' ? newValue.place_id : null;

    // Update the parent component with the selected value
    onChange(selectedValue);

    // If we have a place_id and Google Maps is available, get the coordinates
    if (placeId && placesService.current && mapType === 'google') {
      placesService.current.getDetails(
        { placeId, fields: ['geometry'] },
        (place, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK && place && place.geometry && place.geometry.location) {
            const coordinates = {
              lat: place.geometry.location.lat(),
              lng: place.geometry.location.lng(),
            };
            onChange(selectedValue, coordinates);
          } else {
            console.error('Place details error:', status);
          }
        }
      );
    }
    // If using OpenStreetMap, search for coordinates using Nominatim
    else if (mapType === 'openstreetmap' && selectedValue) {
      searchWithNominatim(selectedValue).then(results => {
        if (results.length > 0) {
          onChange(selectedValue, { lat: results[0].lat, lng: results[0].lng });
        }
      });
    }
  };

  // If Google Maps API key is missing but we're using OpenStreetMap, that's fine
  if (!isValidApiKey && mapType === 'google') {
    return (
      <Box sx={{ mb: 2 }}>
        <TextField 
          label={label}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          disabled={disabled}
          fullWidth
          placeholder={placeholder}
          helperText="Google Maps API key is missing or invalid. Switch to OpenStreetMap or add a valid API key."
          error
        />
      </Box>
    );
  }

  if (!isLoaded && mapType === 'google') {
    return <TextField label={label} disabled fullWidth helperText="Loading Google Maps API..." />;
  }

  return (
    <Box sx={{ mb: 2 }}>
      <Autocomplete
        freeSolo
        options={options}
        getOptionLabel={(option) => 
          typeof option === 'string' ? option : option.description
        }
        filterOptions={(x) => x}
        loading={loading}
        value={value}
        onChange={handleChange}
        onInputChange={handleInputChange}
        renderInput={(params) => (
          <TextField
            {...params}
            label={label}
            placeholder={placeholder}
            required={required}
            disabled={disabled}
            fullWidth
            InputProps={{
              ...params.InputProps,
              endAdornment: (
                <React.Fragment>
                  {loading ? <CircularProgress color="inherit" size={20} /> : null}
                  {params.InputProps.endAdornment}
                </React.Fragment>
              ),
            }}
          />
        )}
        renderOption={(props, option) => (
          <Box component="li" {...props}>
            {option.description}
          </Box>
        )}
        disabled={!apiLoaded}
      />
      {error && (
        <Alert severity="error" sx={{ mt: 1 }}>
          {error}
          {error.includes('API key') && mapType === 'google' && (
            <Typography variant="caption" sx={{ display: 'block', mt: 1 }}>
              You need to enable the Places API for your Google Maps API key in the 
              <Link href="https://console.cloud.google.com/apis/library/places-backend.googleapis.com" target="_blank" sx={{ mx: 1 }}>
                Google Cloud Console
              </Link>
              and ensure your API key has no restrictions or has the correct domain restrictions.
              Alternatively, switch to OpenStreetMap which doesn't require an API key.
            </Typography>
          )}
        </Alert>
      )}
    </Box>
  );
};

export default LocationSearch; 