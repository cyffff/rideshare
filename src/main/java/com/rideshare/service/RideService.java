package com.rideshare.service;

import com.rideshare.dto.RideRequest;
import com.rideshare.model.Ride;
import com.rideshare.model.User;

import java.util.List;

public interface RideService {
    
    /**
     * Request a new ride
     * @param request The ride request details
     * @param passenger The passenger requesting the ride
     * @return The created ride
     */
    Ride requestRide(RideRequest request, User passenger);
    
    /**
     * Schedule a ride for a future time
     * @param request The ride request details
     * @param passenger The passenger scheduling the ride
     * @return The scheduled ride
     */
    Ride scheduleRide(RideRequest request, User passenger);
    
    /**
     * Cancel a ride
     * @param rideId The ride ID to cancel
     * @param userId The user ID of the person cancelling the ride
     * @return The cancelled ride
     */
    Ride cancelRide(Long rideId, Long userId);
    
    /**
     * Accept a ride request (for drivers)
     * @param rideId The ride ID to accept
     * @param driver The driver accepting the ride
     * @return The accepted ride
     */
    Ride acceptRide(Long rideId, User driver);
    
    /**
     * Start a ride (for drivers)
     * @param rideId The ride ID to start
     * @param driverId The driver ID starting the ride
     * @return The started ride
     */
    Ride startRide(Long rideId, Long driverId);
    
    /**
     * Complete a ride (for drivers)
     * @param rideId The ride ID to complete
     * @param driverId The driver ID completing the ride
     * @return The completed ride
     */
    Ride completeRide(Long rideId, Long driverId);
    
    /**
     * Rate a driver after a ride
     * @param rideId The ride ID
     * @param passengerId The passenger ID giving the rating
     * @param rating The rating value
     * @param review Optional review text
     * @return The updated ride
     */
    Ride rateDriver(Long rideId, Long passengerId, Double rating, String review);
    
    /**
     * Rate a passenger after a ride
     * @param rideId The ride ID
     * @param driverId The driver ID giving the rating
     * @param rating The rating value
     * @param review Optional review text
     * @return The updated ride
     */
    Ride ratePassenger(Long rideId, Long driverId, Double rating, String review);
    
    /**
     * Get a ride by ID
     * @param id The ride ID
     * @return The ride
     */
    Ride getRide(Long id);
    
    /**
     * Find rides by user (either as passenger or driver)
     * @param user The user
     * @return List of rides for the user
     */
    List<Ride> findRidesByUser(User user);
    
    /**
     * Find active rides for a driver
     * @param driverId The driver ID
     * @return The active ride, or null if none
     */
    Ride findActiveRideForDriver(Long driverId);
    
    /**
     * Find active rides for a passenger
     * @param passengerId The passenger ID
     * @return The active ride, or null if none
     */
    Ride findActiveRideForPassenger(Long passengerId);
    
    /**
     * Find nearby available rides (for drivers)
     * @param latitude Driver's latitude
     * @param longitude Driver's longitude
     * @param radiusInKm Search radius in kilometers
     * @return List of available rides nearby
     */
    List<Ride> findNearbyAvailableRides(Double latitude, Double longitude, Double radiusInKm);
    
    /**
     * Find available shared rides that match a passenger's route
     * @param request The passenger's ride request
     * @return List of available shared rides
     */
    List<Ride> findAvailableSharedRides(RideRequest request);
    
    /**
     * Join a shared ride
     * @param sharedRideId The shared ride ID to join
     * @param passengerId The passenger ID joining the ride
     * @return The updated shared ride
     */
    Ride joinSharedRide(Long sharedRideId, Long passengerId);
    
    /**
     * Check if a ride is owned by a specific user
     * @param rideId The ride ID
     * @param userId The user ID
     * @return True if the ride is owned by the user, false otherwise
     */
    boolean isRideOwnedByUser(Long rideId, Long userId);
} 