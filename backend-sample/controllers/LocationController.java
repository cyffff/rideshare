package com.rideshare.controller;

import com.rideshare.dto.LocationSuggestionDTO;
import com.rideshare.service.LocationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Controller for handling location-related operations
 */
@RestController
@RequestMapping("/api/locations")
public class LocationController {
    private final LocationService locationService;
    
    public LocationController(LocationService locationService) {
        this.locationService = locationService;
    }
    
    /**
     * Get location suggestions
     * @param query The search query
     * @return A list of location suggestions
     */
    @GetMapping("/suggestions")
    public ResponseEntity<List<LocationSuggestionDTO>> getSuggestions(
            @RequestParam(value = "query", required = true) String query) {
        
        List<LocationSuggestionDTO> suggestions = locationService.getSuggestions(query);
        return ResponseEntity.ok(suggestions);
    }
    
    /**
     * Get directions between two points
     * @param originLat Origin latitude
     * @param originLng Origin longitude
     * @param destLat Destination latitude
     * @param destLng Destination longitude
     * @return Directions information
     */
    @GetMapping("/directions")
    public ResponseEntity<Map<String, Object>> getDirections(
            @RequestParam(value = "originLat") double originLat,
            @RequestParam(value = "originLng") double originLng,
            @RequestParam(value = "destLat") double destLat,
            @RequestParam(value = "destLng") double destLng) {
        
        Map<String, Object> directions = locationService.getDirections(
            originLat, originLng, destLat, destLng);
        
        return ResponseEntity.ok(directions);
    }
} 