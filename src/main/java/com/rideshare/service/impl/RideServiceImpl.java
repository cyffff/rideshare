package com.rideshare.service.impl;

import com.rideshare.dto.RideRequest;
import com.rideshare.exception.RideException;
import com.rideshare.model.Ride;
import com.rideshare.model.RideStatus;
import com.rideshare.model.User;
import com.rideshare.model.UserRole;
import com.rideshare.repository.RideRepository;
import com.rideshare.repository.UserRepository;
import com.rideshare.service.RideService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class RideServiceImpl implements RideService {

    private final RideRepository rideRepository;
    private final UserRepository userRepository;

    @Autowired
    public RideServiceImpl(RideRepository rideRepository, UserRepository userRepository) {
        this.rideRepository = rideRepository;
        this.userRepository = userRepository;
    }

    @Override
    @Transactional
    public Ride requestRide(RideRequest request, User passenger) {
        validateRideRequest(request);

        if (!isValidPickupTime(request.getRideTime())) {
            throw new RideException("Ride time must be at least 5 minutes in the future");
        }

        Ride ride = new Ride();
        ride.setPassenger(passenger);
        ride.setPickupLocation(request.getPickupLocation());
        ride.setDropoffLocation(request.getDropoffLocation());
        ride.setRideTime(request.getRideTime());
        ride.setSeats(request.getSeats());
        ride.setStatus(RideStatus.REQUESTED);
        ride.setIsShared(false);
        
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
        BigDecimal price = calculatePrice(request);
        ride.setPrice(price);
        
        // Calculate estimated distance and duration
        if (request.getPickupCoordinates() != null && request.getDropoffCoordinates() != null) {
            double distance = calculateDistance(
                request.getPickupCoordinates().getLat(), request.getPickupCoordinates().getLng(),
                request.getDropoffCoordinates().getLat(), request.getDropoffCoordinates().getLng()
            );
            ride.setEstimatedDistance(BigDecimal.valueOf(distance));
            
            // Assuming average speed of 40 km/h for city driving
            int estimatedDuration = (int) (distance * 60 / 40); // in minutes
            ride.setEstimatedDuration(estimatedDuration);
        }

        return rideRepository.save(ride);
    }

    @Override
    @Transactional
    public Ride scheduleRide(RideRequest request, User passenger) {
        validateRideRequest(request);
        
        // Scheduled rides must be at least 1 hour in the future
        if (request.getRideTime().isBefore(LocalDateTime.now().plusHours(1))) {
            throw new RideException("Scheduled rides must be at least 1 hour in the future");
        }
        
        Ride ride = new Ride();
        ride.setPassenger(passenger);
        ride.setPickupLocation(request.getPickupLocation());
        ride.setDropoffLocation(request.getDropoffLocation());
        ride.setRideTime(request.getRideTime());
        ride.setSeats(request.getSeats());
        ride.setStatus(RideStatus.SCHEDULED);
        ride.setIsShared(false);
        
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
        BigDecimal price = calculatePrice(request);
        ride.setPrice(price);
        
        // Calculate estimated distance and duration
        if (request.getPickupCoordinates() != null && request.getDropoffCoordinates() != null) {
            double distance = calculateDistance(
                request.getPickupCoordinates().getLat(), request.getPickupCoordinates().getLng(),
                request.getDropoffCoordinates().getLat(), request.getDropoffCoordinates().getLng()
            );
            ride.setEstimatedDistance(BigDecimal.valueOf(distance));
            
            // Assuming average speed of 40 km/h for city driving
            int estimatedDuration = (int) (distance * 60 / 40); // in minutes
            ride.setEstimatedDuration(estimatedDuration);
        }

        return rideRepository.save(ride);
    }

    @Override
    @Transactional
    public Ride cancelRide(Long rideId, Long userId) {
        Ride ride = getRide(rideId);
        
        // Check if user has permission to cancel the ride
        boolean isPassenger = ride.getPassenger() != null && ride.getPassenger().getId().equals(userId);
        
        if (!isPassenger && !isDriverForRide(ride, userId)) {
            throw new RideException("You don't have permission to cancel this ride");
        }
        
        // Check if ride can be cancelled
        if (ride.getStatus() == RideStatus.COMPLETED || ride.getStatus() == RideStatus.CANCELLED) {
            throw new RideException("This ride cannot be cancelled");
        }
        
        // Apply cancellation fee if applicable
        if (ride.getStatus() == RideStatus.IN_PROGRESS) {
            // Logic for cancellation fee when ride is in progress
            // This could involve a payment processor call
        }
        
        ride.setStatus(RideStatus.CANCELLED);
        return rideRepository.save(ride);
    }

    @Override
    @Transactional
    public Ride acceptRide(Long rideId, User driver) {
        if (driver.getRole() != UserRole.DRIVER) {
            throw new RideException("Only drivers can accept rides");
        }

        Ride ride = getRide(rideId);

        if (ride.getStatus() != RideStatus.REQUESTED) {
            throw new RideException("Ride is not available for acceptance");
        }

        if (ride.getDriver() != null && !ride.getDriver().equals(driver)) {
            throw new RideException("Ride already accepted by another driver");
        }

        ride.setDriver(driver);
        ride.setStatus(RideStatus.ACCEPTED);
        return rideRepository.save(ride);
    }

    @Override
    @Transactional
    public Ride startRide(Long rideId, Long driverId) {
        Ride ride = getRide(rideId);
        
        if (!isDriverForRide(ride, driverId)) {
            throw new RideException("Only the assigned driver can start this ride");
        }
        
        if (ride.getStatus() != RideStatus.ACCEPTED) {
            throw new RideException("Ride must be in ACCEPTED state to start");
        }
        
        ride.setStatus(RideStatus.IN_PROGRESS);
        ride.setStartTime(LocalDateTime.now());
        
        return rideRepository.save(ride);
    }

    @Override
    @Transactional
    public Ride completeRide(Long rideId, Long driverId) {
        Ride ride = getRide(rideId);
        
        if (!isDriverForRide(ride, driverId)) {
            throw new RideException("Only the assigned driver can complete this ride");
        }
        
        if (ride.getStatus() != RideStatus.IN_PROGRESS) {
            throw new RideException("Ride must be in IN_PROGRESS state to complete");
        }
        
        ride.setStatus(RideStatus.COMPLETED);
        ride.setEndTime(LocalDateTime.now());
        
        // Calculate actual distance and duration if needed
        // This could be based on GPS data collected during the ride
        
        return rideRepository.save(ride);
    }

    @Override
    @Transactional
    public Ride rateDriver(Long rideId, Long passengerId, Double rating, String review) {
        Ride ride = getRide(rideId);
        
        if (ride.getPassenger() == null || !ride.getPassenger().getId().equals(passengerId)) {
            throw new RideException("Only the passenger can rate the driver");
        }
        
        if (ride.getStatus() != RideStatus.COMPLETED) {
            throw new RideException("Only completed rides can be rated");
        }
        
        if (ride.getDriverRating() != null) {
            throw new RideException("Driver has already been rated for this ride");
        }
        
        // Validate rating
        if (rating < 1.0 || rating > 5.0) {
            throw new RideException("Rating must be between 1 and 5");
        }
        
        ride.setDriverRating(rating);
        ride.setDriverReview(review);
        
        // Update driver's overall rating
        if (ride.getDriver() != null) {
            updateUserRating(ride.getDriver().getId(), rating);
        }
        
        return rideRepository.save(ride);
    }

    @Override
    @Transactional
    public Ride ratePassenger(Long rideId, Long driverId, Double rating, String review) {
        Ride ride = getRide(rideId);
        
        if (!isDriverForRide(ride, driverId)) {
            throw new RideException("Only the driver can rate the passenger");
        }
        
        if (ride.getStatus() != RideStatus.COMPLETED) {
            throw new RideException("Only completed rides can be rated");
        }
        
        if (ride.getPassengerRating() != null) {
            throw new RideException("Passenger has already been rated for this ride");
        }
        
        // Validate rating
        if (rating < 1.0 || rating > 5.0) {
            throw new RideException("Rating must be between 1 and 5");
        }
        
        ride.setPassengerRating(rating);
        ride.setPassengerReview(review);
        
        // Update passenger's overall rating
        if (ride.getPassenger() != null) {
            updateUserRating(ride.getPassenger().getId(), rating);
        }
        
        return rideRepository.save(ride);
    }

    @Override
    public Ride getRide(Long id) {
        return rideRepository.findById(id)
            .orElseThrow(() -> new RideException("Ride not found"));
    }

    @Override
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

    @Override
    public Ride findActiveRideForDriver(Long driverId) {
        User driver = userRepository.findById(driverId)
            .orElseThrow(() -> new RideException("Driver not found"));
        
        // Find rides that are accepted, in_progress, or driver_arrived
        List<Ride> activeRides = rideRepository.findByDriverAndStatusIn(
            driver, 
            List.of(RideStatus.ACCEPTED, RideStatus.IN_PROGRESS)
        );
        
        return activeRides.isEmpty() ? null : activeRides.get(0);
    }

    @Override
    public Ride findActiveRideForPassenger(Long passengerId) {
        User passenger = userRepository.findById(passengerId)
            .orElseThrow(() -> new RideException("Passenger not found"));
        
        // Find rides that are requested, accepted, in_progress, or driver_arrived
        List<Ride> activeRides = rideRepository.findByPassengerAndStatusIn(
            passenger, 
            List.of(RideStatus.REQUESTED, RideStatus.ACCEPTED, RideStatus.IN_PROGRESS)
        );
        
        return activeRides.isEmpty() ? null : activeRides.get(0);
    }

    @Override
    public List<Ride> findNearbyAvailableRides(Double latitude, Double longitude, Double radiusInKm) {
        // This would typically use a database with geospatial capabilities
        // For this example, we'll get all requested rides and filter by distance
        List<Ride> requestedRides = rideRepository.findByStatus(RideStatus.REQUESTED);
        
        return requestedRides.stream()
            .filter(ride -> ride.getPickupLat() != null && ride.getPickupLng() != null)
            .filter(ride -> {
                double distance = calculateDistance(
                    latitude, longitude,
                    ride.getPickupLat().doubleValue(), ride.getPickupLng().doubleValue()
                );
                return distance <= radiusInKm;
            })
            .collect(Collectors.toList());
    }

    @Override
    public List<Ride> findAvailableSharedRides(RideRequest request) {
        // Find rides that are already requested or accepted but marked as shared
        // and have similar routes to the current request
        
        if (request.getPickupCoordinates() == null || request.getDropoffCoordinates() == null) {
            return List.of(); // Can't match without coordinates
        }
        
        List<Ride> sharedRides = rideRepository.findByIsSharedAndStatusIn(
            true,
            List.of(RideStatus.REQUESTED, RideStatus.ACCEPTED)
        );
        
        // Filter rides by proximity to pickup and dropoff locations
        return sharedRides.stream()
            .filter(ride -> ride.getPickupLat() != null && ride.getPickupLng() != null &&
                          ride.getDropoffLat() != null && ride.getDropoffLng() != null)
            .filter(ride -> {
                // Calculate pickup proximity
                double pickupDistance = calculateDistance(
                    request.getPickupCoordinates().getLat(), request.getPickupCoordinates().getLng(),
                    ride.getPickupLat().doubleValue(), ride.getPickupLng().doubleValue()
                );
                
                // Calculate dropoff proximity
                double dropoffDistance = calculateDistance(
                    request.getDropoffCoordinates().getLat(), request.getDropoffCoordinates().getLng(),
                    ride.getDropoffLat().doubleValue(), ride.getDropoffLng().doubleValue()
                );
                
                // Rides are matchable if pickup and dropoff are within reasonable distances
                return pickupDistance <= 2.0 && dropoffDistance <= 2.0;
            })
            .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public Ride joinSharedRide(Long sharedRideId, Long passengerId) {
        Ride sharedRide = getRide(sharedRideId);
        User passenger = userRepository.findById(passengerId)
            .orElseThrow(() -> new RideException("Passenger not found"));
        
        if (!sharedRide.getIsShared()) {
            throw new RideException("This ride is not available for sharing");
        }
        
        if (sharedRide.getStatus() != RideStatus.REQUESTED && sharedRide.getStatus() != RideStatus.ACCEPTED) {
            throw new RideException("This shared ride cannot be joined at this time");
        }
        
        if (sharedRide.getSecondPassenger() != null) {
            throw new RideException("This shared ride is already full");
        }
        
        // Add second passenger to the ride
        sharedRide.setSecondPassenger(passenger);
        
        // Apply shared ride discount (e.g., 25% off for both passengers)
        BigDecimal discountedPrice = sharedRide.getPrice().multiply(BigDecimal.valueOf(0.75));
        sharedRide.setPrice(discountedPrice);
        
        return rideRepository.save(sharedRide);
    }
    
    @Override
    public boolean isRideOwnedByUser(Long rideId, Long userId) {
        Ride ride = getRide(rideId);
        
        boolean isPassenger = ride.getPassenger() != null && ride.getPassenger().getId().equals(userId);
        boolean isSecondPassenger = ride.getSecondPassenger() != null && ride.getSecondPassenger().getId().equals(userId);
        boolean isDriver = isDriverForRide(ride, userId);
        
        return isPassenger || isSecondPassenger || isDriver;
    }
    
    // Helper methods
    
    private boolean isDriverForRide(Ride ride, Long driverId) {
        return ride.getDriver() != null && ride.getDriver().getId().equals(driverId);
    }
    
    private boolean isValidPickupTime(LocalDateTime pickupTime) {
        // Ride must be at least 5 minutes in the future
        return pickupTime.isAfter(LocalDateTime.now().plusMinutes(5));
    }
    
    private void validateRideRequest(RideRequest request) {
        if (request.getPickupLocation() == null || request.getPickupLocation().isEmpty()) {
            throw new RideException("Pickup location is required");
        }
        
        if (request.getDropoffLocation() == null || request.getDropoffLocation().isEmpty()) {
            throw new RideException("Dropoff location is required");
        }
        
        if (request.getSeats() < 1) {
            throw new RideException("At least one seat is required");
        }
        
        if (request.getRideTime() == null) {
            throw new RideException("Ride time is required");
        }
    }
    
    private BigDecimal calculatePrice(RideRequest request) {
        // Base price
        double basePrice = 5.0;
        
        // Price per seat
        double seatPrice = 2.0 * request.getSeats();
        
        // Calculate distance-based price if coordinates are available
        double distancePrice = 0.0;
        if (request.getPickupCoordinates() != null && request.getDropoffCoordinates() != null) {
            double distance = calculateDistance(
                request.getPickupCoordinates().getLat(), request.getPickupCoordinates().getLng(),
                request.getDropoffCoordinates().getLat(), request.getDropoffCoordinates().getLng()
            );
            
            // Price per kilometer (or mile)
            distancePrice = distance * 1.5;
        } else {
            // Default distance price if coordinates not available
            distancePrice = 10.0;
        }
        
        // Apply time-of-day pricing (e.g., surge pricing during peak hours)
        LocalDateTime rideTime = request.getRideTime();
        double timeMultiplier = 1.0;
        
        int hour = rideTime.getHour();
        if ((hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19)) {
            // Peak hours: 7-9 AM and 5-7 PM
            timeMultiplier = 1.5;
        } else if (hour >= 22 || hour <= 5) {
            // Late night: 10 PM - 5 AM
            timeMultiplier = 1.25;
        }
        
        // Total price with time multiplier
        double totalPrice = (basePrice + seatPrice + distancePrice) * timeMultiplier;
        
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
    
    private void updateUserRating(Long userId, Double newRating) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RideException("User not found"));
        
        // Get current rating and count
        Double currentRating = user.getRating();
        Integer ratingCount = user.getRatingCount();
        
        if (currentRating == null) {
            currentRating = 0.0;
        }
        
        if (ratingCount == null) {
            ratingCount = 0;
        }
        
        // Calculate new average rating
        Double totalRating = currentRating * ratingCount + newRating;
        ratingCount++;
        Double newAverageRating = totalRating / ratingCount;
        
        // Update user's rating
        user.setRating(newAverageRating);
        user.setRatingCount(ratingCount);
        
        userRepository.save(user);
    }
} 