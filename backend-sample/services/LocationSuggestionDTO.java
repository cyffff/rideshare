package com.rideshare.dto;

/**
 * Data Transfer Object for location suggestions
 */
public class LocationSuggestionDTO {
    private String description;
    private double lat;
    private double lng;
    
    public LocationSuggestionDTO() {
    }
    
    public LocationSuggestionDTO(String description, double lat, double lng) {
        this.description = description;
        this.lat = lat;
        this.lng = lng;
    }
    
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
    }
    
    public double getLat() {
        return lat;
    }
    
    public void setLat(double lat) {
        this.lat = lat;
    }
    
    public double getLng() {
        return lng;
    }
    
    public void setLng(double lng) {
        this.lng = lng;
    }
} 