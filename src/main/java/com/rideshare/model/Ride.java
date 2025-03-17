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

    @ManyToOne
    @JoinColumn(name = "second_passenger_id")
    private User secondPassenger;

    @Column(nullable = false)
    private String pickupLocation;

    @Column(nullable = false)
    private String dropoffLocation;

    private BigDecimal pickupLat;
    private BigDecimal pickupLng;
    private BigDecimal dropoffLat;
    private BigDecimal dropoffLng;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RideStatus status = RideStatus.REQUESTED;

    private BigDecimal price;
    private BigDecimal estimatedDistance;
    private Integer estimatedDuration; // in minutes
    private LocalDateTime rideTime;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private Boolean isShared = false;
    private Integer seats = 1;
    private String paymentIntentId;
    private Boolean isPaid = false;
    private String cancellationReason;
    private Double driverRating;
    private Double passengerRating;
    @Column(columnDefinition = "TEXT")
    private String driverReview;
    @Column(columnDefinition = "TEXT")
    private String passengerReview;
    private String notes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // Compatibility methods for legacy code
    public Double getPickupLatitude() {
        return pickupLat != null ? pickupLat.doubleValue() : null;
    }

    public void setPickupLatitude(Double latitude) {
        this.pickupLat = latitude != null ? BigDecimal.valueOf(latitude) : null;
    }

    public Double getPickupLongitude() {
        return pickupLng != null ? pickupLng.doubleValue() : null;
    }

    public void setPickupLongitude(Double longitude) {
        this.pickupLng = longitude != null ? BigDecimal.valueOf(longitude) : null;
    }

    public Double getDropoffLatitude() {
        return dropoffLat != null ? dropoffLat.doubleValue() : null;
    }

    public void setDropoffLatitude(Double latitude) {
        this.dropoffLat = latitude != null ? BigDecimal.valueOf(latitude) : null;
    }

    public Double getDropoffLongitude() {
        return dropoffLng != null ? dropoffLng.doubleValue() : null;
    }

    public void setDropoffLongitude(Double longitude) {
        this.dropoffLng = longitude != null ? BigDecimal.valueOf(longitude) : null;
    }

    public Double getDistance() {
        return estimatedDistance != null ? estimatedDistance.doubleValue() : null;
    }

    public void setDistance(Double distance) {
        this.estimatedDistance = distance != null ? BigDecimal.valueOf(distance) : null;
    }

    public Double getPrice() {
        return price != null ? price.doubleValue() : null;
    }

    public void setPrice(Double price) {
        this.price = price != null ? BigDecimal.valueOf(price) : null;
    }

    // Method to handle BigDecimal price setting
    public void setPrice(BigDecimal price) {
        this.price = price;
    }
} 