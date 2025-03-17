package com.rideshare.service;

import com.rideshare.dto.LocationDTO;
import com.rideshare.dto.LocationSuggestionDTO;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.Cacheable;

import java.util.ArrayList;
import java.util.List;
import java.util.HashMap;
import java.util.Map;

/**
 * Service for handling location-related operations
 * Provides geocoding, reverse geocoding, and location suggestions
 */
@Service
public class LocationService {
    private static final Logger logger = LoggerFactory.getLogger(LocationService.class);
    private final RestTemplate restTemplate;
    
    @Value("${google.maps.api.key}")
    private String googleMapsApiKey;
    
    // Pre-defined UAE locations for fast access
    private final Map<String, LocationDTO> uaeLocations = new HashMap<>();
    
    public LocationService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
        
        // Initialize UAE locations
        initializeUAELocations();
    }
    
    private void initializeUAELocations() {
        // Abu Dhabi locations
        uaeLocations.put("abu dhabi", new LocationDTO("Abu Dhabi, UAE", 24.4539, 54.3773));
        uaeLocations.put("abu dhabi corniche", new LocationDTO("Abu Dhabi Corniche, UAE", 24.4672, 54.3567));
        uaeLocations.put("abu dhabi mall", new LocationDTO("Abu Dhabi Mall, UAE", 24.4979, 54.3809));
        uaeLocations.put("sheikh zayed grand mosque", new LocationDTO("Sheikh Zayed Grand Mosque, Abu Dhabi, UAE", 24.4128, 54.4750));
        
        // Reem Island locations
        uaeLocations.put("reem island", new LocationDTO("Reem Island, Abu Dhabi, UAE", 24.4991, 54.4017));
        uaeLocations.put("reem mall", new LocationDTO("Reem Mall, Reem Island, Abu Dhabi, UAE", 24.5038, 54.4066));
        uaeLocations.put("reem village", new LocationDTO("Reem Village, Reem Island, Abu Dhabi, UAE", 24.4924, 54.3972));
        
        // Yas Island locations
        uaeLocations.put("yas island", new LocationDTO("Yas Island, Abu Dhabi, UAE", 24.4959, 54.6056));
        uaeLocations.put("yas mall", new LocationDTO("Yas Mall, Abu Dhabi, UAE", 24.4913, 54.6068));
        uaeLocations.put("ferrari world", new LocationDTO("Ferrari World, Yas Island, Abu Dhabi, UAE", 24.4831, 54.6036));
        
        // Dubai locations
        uaeLocations.put("dubai", new LocationDTO("Dubai, UAE", 25.2048, 55.2708));
        uaeLocations.put("dubai mall", new LocationDTO("Dubai Mall, Dubai, UAE", 25.1972, 55.2744));
        uaeLocations.put("burj khalifa", new LocationDTO("Burj Khalifa, Dubai, UAE", 25.1972, 55.2740));
        uaeLocations.put("dubai marina", new LocationDTO("Dubai Marina, Dubai, UAE", 25.0763, 55.1304));
    }
    
    /**
     * Get location suggestions based on a query
     * @param query The search text
     * @return A list of location suggestions
     */
    @Cacheable("locationSuggestions")
    public List<LocationSuggestionDTO> getSuggestions(String query) {
        logger.info("Getting location suggestions for query: {}", query);
        
        if (query == null || query.trim().isEmpty()) {
            return new ArrayList<>();
        }
        
        String queryLower = query.toLowerCase().trim();
        List<LocationSuggestionDTO> suggestions = new ArrayList<>();
        
        // First check our pre-defined UAE locations for fast results
        for (Map.Entry<String, LocationDTO> entry : uaeLocations.entrySet()) {
            if (entry.getKey().contains(queryLower) || 
                handleTyposAndPartials(entry.getKey(), queryLower)) {
                LocationDTO location = entry.getValue();
                suggestions.add(new LocationSuggestionDTO(
                    location.getAddress(),
                    location.getLatitude(),
                    location.getLongitude()
                ));
                
                // Limit to 5 suggestions from our database
                if (suggestions.size() >= 5) {
                    break;
                }
            }
        }
        
        // If we don't have enough suggestions, call external API
        if (suggestions.size() < 5 && googleMapsApiKey != null && !googleMapsApiKey.isEmpty()) {
            try {
                // Call Google Places API for more suggestions
                // This would be implemented in a production system
                // For demo we'll return what we have
            } catch (Exception e) {
                logger.error("Error calling Google Places API: {}", e.getMessage());
            }
        }
        
        return suggestions;
    }
    
    /**
     * Handle typos and partial matches
     * @param baseKey The original key
     * @param query The user query
     * @return True if the query is a typo or partial match for the key
     */
    private boolean handleTyposAndPartials(String baseKey, String query) {
        // Check for partial matches (start of words)
        String[] baseWords = baseKey.split("\\s+");
        for (String word : baseWords) {
            if (word.startsWith(query) || query.startsWith(word)) {
                return true;
            }
        }
        
        // Handle common typos for "abu dhabi"
        if (baseKey.contains("abu dhabi") && 
            (query.contains("dbu") || query.contains("abu") || 
             query.contains("abo") || 
             (query.contains("ab") && query.contains("dha")))) {
            return true;
        }
        
        // Handle common typos for "reem"
        if (baseKey.contains("reem") && 
            (query.contains("rem") || query.contains("riim") || 
             query.contains("rim"))) {
            return true;
        }
        
        // Check Levenshtein distance for small typos
        if (baseKey.length() > 3 && query.length() > 3) {
            int distance = levenshteinDistance(baseKey, query);
            return distance <= 2; // Allow up to 2 character differences
        }
        
        return false;
    }
    
    /**
     * Calculate Levenshtein distance between two strings
     * Used for fuzzy matching and handling typos
     */
    private int levenshteinDistance(String a, String b) {
        int[] costs = new int[b.length() + 1];
        for (int j = 0; j <= b.length(); j++) {
            costs[j] = j;
        }
        for (int i = 1; i <= a.length(); i++) {
            costs[0] = i;
            int nw = i - 1;
            for (int j = 1; j <= b.length(); j++) {
                int cj = Math.min(1 + Math.min(costs[j], costs[j - 1]), 
                                  a.charAt(i - 1) == b.charAt(j - 1) ? nw : nw + 1);
                nw = costs[j];
                costs[j] = cj;
            }
        }
        return costs[b.length()];
    }
    
    /**
     * Get directions between two points
     * @param originLat Origin latitude
     * @param originLng Origin longitude
     * @param destLat Destination latitude
     * @param destLng Destination longitude
     * @return A DirectionsDTO with route information
     */
    public Map<String, Object> getDirections(
            double originLat, double originLng, 
            double destLat, double destLng) {
        
        logger.info("Getting directions from ({},{}) to ({},{})", 
                  originLat, originLng, destLat, destLng);
        
        // In a real implementation, this would call Google Directions API
        // For demo, we'll calculate a simplified route
        
        // Calculate direct distance using Haversine formula
        double directDistance = calculateHaversineDistance(
            originLat, originLng, destLat, destLng);
        
        // Real-world routes are typically 20-40% longer than direct distance
        double routeFactor = 1.2 + Math.random() * 0.2; // Between 1.2 and 1.4
        double distance = directDistance * routeFactor;
        
        // Estimate duration (assuming average 30 mph)
        int duration = (int) Math.round(distance * 2); // 2 minutes per mile
        
        // Generate waypoints (simplified)
        List<Map<String, Object>> waypoints = new ArrayList<>();
        
        // Create response object
        Map<String, Object> response = new HashMap<>();
        response.put("distance", distance);
        response.put("duration", duration);
        response.put("waypoints", waypoints);
        
        return response;
    }
    
    /**
     * Calculate distance between two points using Haversine formula
     */
    private double calculateHaversineDistance(
            double lat1, double lon1, double lat2, double lon2) {
        
        final int R = 3963; // Earth's radius in miles
        
        double latDistance = Math.toRadians(lat2 - lat1);
        double lonDistance = Math.toRadians(lon2 - lon1);
        
        double a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(lonDistance / 2) * Math.sin(lonDistance / 2);
        
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        
        return R * c; // Distance in miles
    }
} 