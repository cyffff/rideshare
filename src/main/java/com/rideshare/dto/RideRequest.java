package com.rideshare.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class RideRequest {
    
    @NotBlank(message = "Pickup location is required")
    private String pickupLocation;
    
    @NotBlank(message = "Dropoff location is required")
    private String dropoffLocation;
    
    @NotNull(message = "Ride time is required")
    private LocalDateTime rideTime;
    
    @Min(value = 1, message = "At least one seat is required")
    private int seats;
    
    private Boolean isShared;
    
    private String notes;
    
    private Coordinates pickupCoordinates;
    
    private Coordinates dropoffCoordinates;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Coordinates {
        private Double lat;
        private Double lng;
    }
} 