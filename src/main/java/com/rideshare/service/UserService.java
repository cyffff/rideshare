package com.rideshare.service;

import com.rideshare.model.User;
import java.util.List;
import java.util.Optional;

public interface UserService {
    
    /**
     * Find a user by ID
     * @param id User ID
     * @return Optional containing the user if found
     */
    Optional<User> findById(Long id);
    
    /**
     * Find a user by email
     * @param email User email
     * @return User object
     */
    User findByEmail(String email);
    
    /**
     * Save a user to the database
     * @param user The user to save
     * @return The saved user with ID
     */
    User save(User user);
    
    /**
     * Find all users
     * @return List of all users
     */
    List<User> findAll();
    
    /**
     * Find all users with a specific role
     * @param role The role to filter by
     * @return List of users with the specified role
     */
    List<User> findByRole(String role);
    
    /**
     * Get the Stripe customer ID for a user
     * If the user doesn't have a Stripe customer ID, create one
     * @param userId User ID
     * @return Stripe customer ID
     */
    String getStripeCustomerId(Long userId);
    
    /**
     * Update a user's profile information
     * @param userId User ID
     * @param userDetails User object with updated information
     * @return The updated user
     */
    User updateProfile(Long userId, User userDetails);
    
    /**
     * Update a user's location
     * @param userId User ID
     * @param latitude Latitude
     * @param longitude Longitude
     * @return The updated user
     */
    void updateLocation(Long userId, Double latitude, Double longitude);
    
    /**
     * Find drivers near a location
     * @param latitude Latitude
     * @param longitude Longitude
     * @param radiusInKm Radius in kilometers
     * @return List of nearby drivers
     */
    List<User> findNearbyDrivers(Double latitude, Double longitude, Double radiusInKm);
    
    /**
     * Update a user's rating
     * @param userId User ID
     * @param rating New rating value
     * @return The updated user
     */
    void updateRating(Long userId, Double rating);
    
    /**
     * Increment a user's total rides
     * @param userId User ID
     */
    void incrementTotalRides(Long userId);
} 