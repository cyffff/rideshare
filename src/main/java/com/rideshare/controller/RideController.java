package com.rideshare.controller;

import com.rideshare.dto.RideRequest;
import com.rideshare.model.Ride;
import com.rideshare.model.User;
import com.rideshare.service.RideService;
import com.rideshare.service.StripeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/rides")
@RequiredArgsConstructor
public class RideController {
    private final RideService rideService;
    private final StripeService stripeService;

    // Passenger endpoints
    @PostMapping
    public ResponseEntity<Ride> createRide(
            @Valid @RequestBody RideRequest request,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(rideService.requestRide(request, user));
    }

    @PostMapping("/schedule")
    public ResponseEntity<Ride> scheduleRide(
            @Valid @RequestBody RideRequest request,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(rideService.scheduleRide(request, user));
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<Ride> cancelRide(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(rideService.cancelRide(id, user.getId()));
    }

    @PostMapping("/{id}/rate-driver")
    public ResponseEntity<Ride> rateDriver(
            @PathVariable Long id,
            @RequestParam Double rating,
            @RequestParam(required = false) String review,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(rideService.rateDriver(id, user.getId(), rating, review));
    }

    // Driver endpoints
    @PostMapping("/{id}/accept")
    public ResponseEntity<Ride> acceptRide(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(rideService.acceptRide(id, user));
    }

    @PostMapping("/{id}/start")
    public ResponseEntity<Ride> startRide(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(rideService.startRide(id, user.getId()));
    }

    @PostMapping("/{id}/complete")
    public ResponseEntity<Ride> completeRide(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(rideService.completeRide(id, user.getId()));
    }

    @PostMapping("/{id}/cancel-by-driver")
    public ResponseEntity<Ride> cancelRideByDriver(
            @PathVariable Long id,
            @RequestParam String reason,
            @AuthenticationPrincipal User user) {
        // First cancel the ride normally
        Ride ride = rideService.cancelRide(id, user.getId());
        // Then set the cancellation reason
        // In a real implementation, you might want to add a dedicated method for this
        return ResponseEntity.ok(ride);
    }

    @PostMapping("/{id}/rate-passenger")
    public ResponseEntity<Ride> ratePassenger(
            @PathVariable Long id,
            @RequestParam Double rating,
            @RequestParam(required = false) String review,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(rideService.ratePassenger(id, user.getId(), rating, review));
    }

    // Common endpoints
    @GetMapping("/{id}")
    public ResponseEntity<Ride> getRide(@PathVariable Long id) {
        return ResponseEntity.ok(rideService.getRide(id));
    }

    @GetMapping
    public ResponseEntity<List<Ride>> getRides(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(rideService.findRidesByUser(user));
    }

    @GetMapping("/active")
    public ResponseEntity<Ride> getActiveRide(@AuthenticationPrincipal User user) {
        if (user.getRole().toString().equals("DRIVER")) {
            return ResponseEntity.ok(rideService.findActiveRideForDriver(user.getId()));
        } else {
            return ResponseEntity.ok(rideService.findActiveRideForPassenger(user.getId()));
        }
    }

    @GetMapping("/available")
    public ResponseEntity<List<Ride>> getAvailableRides() {
        // For demo purposes, we'll use findNearbyAvailableRides with default values
        return ResponseEntity.ok(rideService.findNearbyAvailableRides(0.0, 0.0, 100.0));
    }

    @GetMapping("/nearby")
    public ResponseEntity<List<Ride>> getNearbyRides(
            @RequestParam Double latitude,
            @RequestParam Double longitude,
            @RequestParam(defaultValue = "5.0") Double radius) {
        return ResponseEntity.ok(rideService.findNearbyAvailableRides(latitude, longitude, radius));
    }

    // Shared ride endpoints
    @GetMapping("/shared")
    public ResponseEntity<List<Ride>> getAvailableSharedRides(@AuthenticationPrincipal User user) {
        // Create a simple request for the current location
        RideRequest dummyRequest = new RideRequest();
        // In a real app, you would use the user's saved location or current GPS
        return ResponseEntity.ok(rideService.findAvailableSharedRides(dummyRequest));
    }

    @PostMapping("/{id}/join")
    public ResponseEntity<Ride> joinSharedRide(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(rideService.joinSharedRide(id, user.getId()));
    }

    // Payment processing
    @PostMapping("/{id}/process-payment")
    public ResponseEntity<Map<String, String>> processPayment(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {
        Ride ride = rideService.getRide(id);
        
        String paymentIntentId = stripeService.createPaymentIntent(
            ride.getPrice(),
            user.getStripeCustomerId()
        );
        
        Map<String, String> response = new HashMap<>();
        response.put("paymentIntentId", paymentIntentId);
        response.put("publishableKey", stripeService.getPublishableKey());
        
        return ResponseEntity.ok(response);
    }
} 