package com.rideshare.service;

import com.rideshare.dto.RideRequest;
import com.rideshare.exception.RideException;
import com.rideshare.model.Ride;
import com.rideshare.model.RideStatus;
import com.rideshare.model.User;
import com.rideshare.model.UserRole;
import com.rideshare.repository.RideRepository;
import com.rideshare.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class RideService {
    private final RideRepository rideRepository;
    private final UserRepository userRepository;

    @Transactional
    public Ride requestRide(RideRequest request, User passenger) {
        validateRideRequest(request);

        if (request.getRideTime().isBefore(LocalDateTime.now())) {
            throw new RideException("Ride time cannot be in the past");
        }

        Ride ride = new Ride();
        ride.setPassenger(passenger);
        ride.setPickupLocation(request.getPickupLocation());
        ride.setDropoffLocation(request.getDropoffLocation());
        ride.setRideTime(request.getRideTime());
        ride.setSeats(request.getSeats());
        ride.setLuggageSize(request.getLuggageSize());
        ride.setNotes(request.getNotes());
        ride.setStatus(RideStatus.PENDING);
        
        // Set coordinates if available
        if (request.getPickupCoordinates() != null) {
            ride.setPickupLat(request.getPickupCoordinates().getLat());
            ride.setPickupLng(request.getPickupCoordinates().getLng());
        }
        
        if (request.getDropoffCoordinates() != null) {
            ride.setDropoffLat(request.getDropoffCoordinates().getLat());
            ride.setDropoffLng(request.getDropoffCoordinates().getLng());
        }

        // Calculate estimated price based on distance and other factors
        BigDecimal price = calculatePrice(
            request.getPickupLocation(),
            request.getDropoffLocation(),
            request.getSeats(),
            request.getPickupCoordinates(),
            request.getDropoffCoordinates()
        );
        ride.setPrice(price);

        return rideRepository.save(ride);
    }

    private void validateRideRequest(RideRequest request) {
        if (request.getSeats() < 1) {
            throw new RideException("At least one seat is required");
        }
    }

    @Transactional
    public Ride acceptRide(Long rideId, User driver) {
        if (driver.getRole() != UserRole.DRIVER) {
            throw new RideException("Only drivers can accept rides");
        }

        Ride ride = getRide(rideId);

        if (ride.getStatus() != RideStatus.PENDING) {
            throw new RideException("Ride is not available for acceptance");
        }

        if (ride.getDriver() != null && !ride.getDriver().equals(driver)) {
            throw new RideException("Ride already accepted by another driver");
        }

        ride.setDriver(driver);
        ride.setStatus(RideStatus.ACCEPTED);
        return rideRepository.save(ride);
    }

    public List<Ride> findRidesByUser(User user) {
        switch (user.getRole()) {
            case DRIVER:
                return rideRepository.findByDriver(user);
            case PASSENGER:
                return rideRepository.findByPassenger(user);
            default:
                throw new RideException("Invalid user role");
        }
    }

    public Ride getRide(Long id) {
        return rideRepository.findById(id)
            .orElseThrow(() -> new RideException("Ride not found"));
    }

    private BigDecimal calculatePrice(String pickup, String dropoff, int seats, 
                                     RideRequest.Coordinates pickupCoords, 
                                     RideRequest.Coordinates dropoffCoords) {
        // Base price
        double basePrice = 5.0;
        
        // Price per seat
        double seatPrice = 2.0 * seats;
        
        // Calculate distance-based price if coordinates are available
        double distancePrice = 0.0;
        if (pickupCoords != null && dropoffCoords != null) {
            double distance = calculateDistance(
                pickupCoords.getLat(), pickupCoords.getLng(),
                dropoffCoords.getLat(), dropoffCoords.getLng()
            );
            
            // Price per kilometer (or mile)
            distancePrice = distance * 1.5;
        } else {
            // Default distance price if coordinates not available
            distancePrice = 10.0;
        }
        
        // Total price
        double totalPrice = basePrice + seatPrice + distancePrice;
        
        return BigDecimal.valueOf(totalPrice).setScale(2, BigDecimal.ROUND_HALF_UP);
    }
    
    /**
     * Calculate distance between two points using the Haversine formula
     * @return Distance in kilometers
     */
    private double calculateDistance(double lat1, double lon1, double lat2, double lon2) {
        final int R = 6371; // Radius of the earth in km
        
        double latDistance = Math.toRadians(lat2 - lat1);
        double lonDistance = Math.toRadians(lon2 - lon1);
        
        double a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(lonDistance / 2) * Math.sin(lonDistance / 2);
        
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        
        return R * c; // Distance in km
    }
} 