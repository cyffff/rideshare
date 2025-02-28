package com.rideshare.dto;

import com.rideshare.model.LuggageSize;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class RideRequest {
    @NotBlank(message = "Pickup location is required")
    private String pickupLocation;

    @NotBlank(message = "Dropoff location is required")
    private String dropoffLocation;

    @NotNull(message = "Ride time is required")
    @Future(message = "Ride time must be in the future")
    private LocalDateTime rideTime;

    @NotNull(message = "Number of seats is required")
    @Min(value = 1, message = "At least one seat is required")
    private Integer seats;

    @NotNull(message = "Luggage size is required")
    private LuggageSize luggageSize;

    private String notes;
    
    // Coordinates for pickup location
    private Coordinates pickupCoordinates;
    
    // Coordinates for dropoff location
    private Coordinates dropoffCoordinates;
    
    @Data
    public static class Coordinates {
        private double lat;
        private double lng;
    }
} 