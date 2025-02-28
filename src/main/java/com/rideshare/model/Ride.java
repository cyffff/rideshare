package com.rideshare.model;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Data
public class Ride {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "passenger_id")
    private User passenger;

    @ManyToOne
    @JoinColumn(name = "driver_id")
    private User driver;

    private String pickupLocation;
    private String dropoffLocation;
    private LocalDateTime rideTime;
    private Integer seats;
    private BigDecimal price;
    private String notes;

    @Enumerated(EnumType.STRING)
    private RideStatus status;

    @Enumerated(EnumType.STRING)
    private LuggageSize luggageSize;
    
    // Pickup coordinates
    private Double pickupLat;
    private Double pickupLng;
    
    // Dropoff coordinates
    private Double dropoffLat;
    private Double dropoffLng;
} 