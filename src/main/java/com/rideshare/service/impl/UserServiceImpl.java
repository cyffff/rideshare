package com.rideshare.service.impl;

import com.rideshare.model.User;
import com.rideshare.model.UserRole;
import com.rideshare.repository.UserRepository;
import com.rideshare.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;

    @Autowired
    public UserServiceImpl(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public Optional<User> findById(Long id) {
        return userRepository.findById(id);
    }

    @Override
    public User findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    @Override
    public List<User> findAll() {
        return userRepository.findAll();
    }

    @Override
    public List<User> findByRole(String role) {
        // Since there's no direct repository method, we'll filter the results
        return userRepository.findAll().stream()
                .filter(user -> user.getRole().toString().equals(role))
                .collect(Collectors.toList());
    }

    @Override
    public List<User> findNearbyDrivers(Double latitude, Double longitude, Double radiusInKm) {
        // This would typically use a spatial query or a distance calculation
        // For simplicity, we'll just return all drivers for now
        return findByRole("DRIVER");
    }

    @Override
    public User save(User user) {
        return userRepository.save(user);
    }

    @Override
    public void updateRating(Long userId, Double rating) {
        Optional<User> userOpt = findById(userId);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            
            // If rating count is null, initialize it
            if (user.getRatingCount() == null) {
                user.setRatingCount(0);
            }
            
            // If rating is null, initialize it
            if (user.getRating() == null) {
                user.setRating(rating);
                user.setRatingCount(1);
            } else {
                // Calculate new average rating
                Double currentTotalRating = user.getRating() * user.getRatingCount();
                user.setRatingCount(user.getRatingCount() + 1);
                user.setRating((currentTotalRating + rating) / user.getRatingCount());
            }
            
            userRepository.save(user);
        }
    }

    @Override
    public void incrementTotalRides(Long userId) {
        Optional<User> userOpt = findById(userId);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            
            // If totalRides is null, initialize it
            if (user.getTotalRides() == null) {
                user.setTotalRides(1);
            } else {
                user.setTotalRides(user.getTotalRides() + 1);
            }
            
            userRepository.save(user);
        }
    }

    @Override
    public void updateLocation(Long userId, Double latitude, Double longitude) {
        // This would update the user's current location
        // Not implemented in the current model as there are no location fields
    }

    @Override
    public User updateProfile(Long userId, User userDetails) {
        Optional<User> userOpt = findById(userId);
        if (userOpt.isPresent()) {
            User existingUser = userOpt.get();
            
            // Update only non-null fields
            if (userDetails.getName() != null) {
                existingUser.setName(userDetails.getName());
            }
            if (userDetails.getEmail() != null) {
                existingUser.setEmail(userDetails.getEmail());
            }
            if (userDetails.getPhoneNumber() != null) {
                existingUser.setPhoneNumber(userDetails.getPhoneNumber());
            }
            // Add more fields as needed
            
            return userRepository.save(existingUser);
        }
        return null;
    }

    @Override
    public String getStripeCustomerId(Long userId) {
        Optional<User> userOpt = findById(userId);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            return user.getStripeCustomerId();
        }
        return null;
    }
} 