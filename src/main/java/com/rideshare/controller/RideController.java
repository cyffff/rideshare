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

import java.util.List;

@RestController
@RequestMapping("/api/rides")
@RequiredArgsConstructor
public class RideController {
    private final RideService rideService;
    private final StripeService stripeService;

    @PostMapping
    public ResponseEntity<Ride> createRide(
            @Valid @RequestBody RideRequest request,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(rideService.requestRide(request, user));
    }

    @GetMapping
    public ResponseEntity<List<Ride>> getRides(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(rideService.findRidesByUser(user));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Ride> getRide(@PathVariable Long id) {
        return ResponseEntity.ok(rideService.getRide(id));
    }

    @PostMapping("/{id}/accept")
    public ResponseEntity<Ride> acceptRide(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(rideService.acceptRide(id, user));
    }

    @PostMapping("/{id}/payment")
    public ResponseEntity<?> processPayment(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {
        Ride ride = rideService.getRide(id);
        
        if (!ride.getPassenger().equals(user)) {
            return ResponseEntity.badRequest()
                    .body("Only the passenger can make the payment");
        }

        String paymentIntentId = stripeService.createPaymentIntent(
            ride.getPrice(),
            user.getStripeCustomerId()
        );

        return ResponseEntity.ok(paymentIntentId);
    }
} 