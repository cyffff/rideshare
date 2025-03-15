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
        return ResponseEntity.ok(rideService.cancelRide(id, user));
    }

    @PostMapping("/{id}/rate-driver")
    public ResponseEntity<Ride> rateDriver(
            @PathVariable Long id,
            @RequestParam Double rating,
            @RequestParam(required = false) String review,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(rideService.rateDriver(id, rating, review, user));
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
        return ResponseEntity.ok(rideService.startRide(id, user));
    }

    @PostMapping("/{id}/complete")
    public ResponseEntity<Ride> completeRide(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(rideService.completeRide(id, user));
    }

    @PostMapping("/{id}/cancel-by-driver")
    public ResponseEntity<Ride> cancelRideByDriver(
            @PathVariable Long id,
            @RequestParam String reason,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(rideService.cancelRideByDriver(id, reason, user));
    }

    @PostMapping("/{id}/rate-passenger")
    public ResponseEntity<Ride> ratePassenger(
            @PathVariable Long id,
            @RequestParam Double rating,
            @RequestParam(required = false) String review,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(rideService.ratePassenger(id, rating, review, user));
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
    public ResponseEntity<List<Ride>> getActiveRides(@AuthenticationPrincipal User user) {
        if (user.getRole().toString().equals("DRIVER")) {
            return ResponseEntity.ok(rideService.findActiveRidesByDriver(user));
        } else {
            return ResponseEntity.ok(rideService.findActiveRidesByPassenger(user));
        }
    }

    @GetMapping("/available")
    public ResponseEntity<List<Ride>> getAvailableRides() {
        return ResponseEntity.ok(rideService.findAvailableRides());
    }

    @GetMapping("/nearby")
    public ResponseEntity<List<Ride>> getNearbyRides(
            @RequestParam Double latitude,
            @RequestParam Double longitude,
            @RequestParam(defaultValue = "5.0") Double radius) {
        return ResponseEntity.ok(rideService.findNearbyRides(latitude, longitude, radius));
    }

    // Shared ride endpoints
    @GetMapping("/shared")
    public ResponseEntity<List<Ride>> getAvailableSharedRides() {
        return ResponseEntity.ok(rideService.findAvailableSharedRides());
    }

    @PostMapping("/{id}/join")
    public ResponseEntity<Ride> joinSharedRide(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(rideService.joinSharedRide(id, user));
    }

    // Payment processing
    @PostMapping("/{id}/payment")
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