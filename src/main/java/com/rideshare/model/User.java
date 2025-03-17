package com.rideshare.model;

import jakarta.persistence.*;
import lombok.Data;
import com.rideshare.model.UserRole;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Data
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UserRole role;

    private String phoneNumber;
    
    private String profilePicture;
    
    private String stripeCustomerId;
    
    private Double rating = 5.0;
    
    private Integer ratingCount = 0;
    
    private Integer totalRides = 0;
    
    private Boolean isVerified = false;
    
    @Column(columnDefinition = "TEXT")
    private String address;
    
    @OneToMany(mappedBy = "driver")
    private List<Ride> driverRides = new ArrayList<>();
    
    @OneToMany(mappedBy = "passenger")
    private List<Ride> passengerRides = new ArrayList<>();
    
    // Driver specific fields
    private String driverLicense;
    
    private String carModel;
    
    private String carColor;
    
    private String licensePlate;
    
    private Integer carYear;
    
    private Boolean isAvailable = false;
    
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
}