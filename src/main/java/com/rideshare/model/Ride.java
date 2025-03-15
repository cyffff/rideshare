package com.rideshare.model;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Data
@Table(name = "rides")
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

    @Column(nullable = false)
    private String pickupLocation;

    @Column(nullable = false)
    private String dropoffLocation;

    private Double pickupLatitude;
    private Double pickupLongitude;
    private Double dropoffLatitude;
    private Double dropoffLongitude;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RideStatus status = RideStatus.REQUESTED;

    private Double price;
    private Double distance;
    private Integer duration; // in minutes
    private LocalDateTime requestTime;
    private LocalDateTime pickupTime;
    private LocalDateTime dropoffTime;
    private Boolean isShared = false;
    private String paymentIntentId;
    private Boolean isPaid = false;
    private String cancellationReason;
    private Double driverRating;
    private Double passengerRating;
    @Column(columnDefinition = "TEXT")
    private String driverReview;
    @Column(columnDefinition = "TEXT")
    private String passengerReview;
    // For scheduled rides
    private LocalDateTime scheduledTime;
    private Boolean isScheduled = false;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        requestTime = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
} 