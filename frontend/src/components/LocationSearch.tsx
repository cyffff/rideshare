import React, { useState, useEffect } from 'react';
import { TextField, Autocomplete, Box, CircularProgress, Alert } from '@mui/material';
import { useJsApiLoader } from '@react-google-maps/api';

interface LocationSearchProps {
  label: string;
  placeholder?: string;
  value: string;
  onChange: (value: string, coordinates?: { lat: number; lng: number }) => void;
  required?: boolean;
  disabled?: boolean;
}

const LocationSearch: React.FC<LocationSearchProps> = ({
  label,
  placeholder,
  value,
  onChange,
  required = false,
  disabled = false
}) => {
  const [inputValue, setInputValue] = useState(value);
  const [options, setOptions] = useState<{ description: string; place_id: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [autocompleteService, setAutocompleteService] = useState<google.maps.places.AutocompleteService | null>(null);
  const [placesService, setPlacesService] = useState<google.maps.places.PlacesService | null>(null);

  const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY || '';
  const isValidApiKey = apiKey && apiKey !== 'your-google-maps-api-key-here';

  // Load the Google Maps JavaScript API
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: apiKey,
    libraries: ['places']
  });

  // Initialize services when API is loaded
  useEffect(() => {
    if (isLoaded && isValidApiKey) {
      setAutocompleteService(new google.maps.places.AutocompleteService());
      
      // PlacesService requires a DOM element, so we create a dummy div
      const placesDiv = document.createElement('div');
      setPlacesService(new google.maps.places.PlacesService(placesDiv));
    }
  }, [isLoaded, isValidApiKey]);

  // Fetch place predictions when input changes
  useEffect(() => {
    let active = true;

    if (!autocompleteService || inputValue === '' || !isValidApiKey) {
      setOptions([]);
      return undefined;
    }

    setLoading(true);

    autocompleteService.getPlacePredictions(
      {
        input: inputValue,
        types: ['address', 'establishment', 'geocode']
      },
      (predictions, status) => {
        if (status !== google.maps.places.PlacesServiceStatus.OK || !active) {
          setLoading(false);
          return;
        }

        const options = predictions ? predictions.map(prediction => ({
          description: prediction.description,
          place_id: prediction.place_id
        })) : [];

        setOptions(options);
        setLoading(false);
      }
    );

    return () => {
      active = false;
    };
  }, [inputValue, autocompleteService, isValidApiKey]);

  // Get place details and coordinates when a place is selected
  const handlePlaceSelect = (placeId: string) => {
    if (!placesService) return;

    placesService.getDetails(
      {
        placeId,
        fields: ['geometry', 'formatted_address']
      },
      (place, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && place && place.geometry && place.geometry.location) {
          const coordinates = {
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng()
          };
          
          // Call the parent component's onChange with the selected address and coordinates
          onChange(place.formatted_address || '', coordinates);
        }
      }
    );
  };

  if (!isValidApiKey) {
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
          helperText="Google Maps API key is missing or invalid"
          error
        />
      </Box>
    );
  }

  if (!isLoaded) {
    return <TextField label={label} disabled fullWidth />;
  }

  return (
    <Autocomplete
      freeSolo
      options={options}
      getOptionLabel={(option) => 
        typeof option === 'string' ? option : option.description
      }
      filterOptions={(x) => x}
      loading={loading}
      value={value}
      onChange={(event, newValue) => {
        if (typeof newValue === 'string') {
          onChange(newValue);
        } else if (newValue && newValue.place_id) {
          handlePlaceSelect(newValue.place_id);
        } else {
          onChange('');
        }
      }}
      onInputChange={(event, newInputValue) => {
        setInputValue(newInputValue);
      }}
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
    />
  );
};

export default LocationSearch; 