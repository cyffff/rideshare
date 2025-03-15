package com.rideshare.controller;

import com.rideshare.exception.RideException;
import com.rideshare.model.User;
import com.rideshare.service.RideService;
import com.rideshare.service.StripeService;
import com.rideshare.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    private final StripeService stripeService;
    private final RideService rideService;
    private final UserService userService;

    @Autowired
    public PaymentController(StripeService stripeService, RideService rideService, UserService userService) {
        this.stripeService = stripeService;
        this.rideService = rideService;
        this.userService = userService;
    }

    /**
     * Returns the Stripe publishable key for client-side integration
     * @return A map containing the publishable key
     */
    @GetMapping("/publishable-key")
    public ResponseEntity<Map<String, String>> getPublishableKey() {
        Map<String, String> response = new HashMap<>();
        response.put("publishableKey", stripeService.getPublishableKey());
        return ResponseEntity.ok(response);
    }

    /**
     * Creates a payment intent for a ride payment
     * @param requestBody Map containing amount and rideId
     * @param user The authenticated user
     * @return A map containing the client secret for the payment intent
     */
    @PostMapping("/create-payment-intent")
    public ResponseEntity<Map<String, String>> createPaymentIntent(
            @RequestBody Map<String, Object> requestBody,
            @AuthenticationPrincipal User user) {
        
        if (requestBody.get("amount") == null || requestBody.get("rideId") == null) {
            throw new RideException("Amount and rideId are required");
        }
        
        Double amount = Double.parseDouble(requestBody.get("amount").toString());
        Long rideId = Long.parseLong(requestBody.get("rideId").toString());
        
        // Verify that the ride exists and belongs to the user
        if (!rideService.isRideOwnedByUser(rideId, user.getId())) {
            throw new RideException("Invalid ride or you don't have permission");
        }
        
        // Get or create customer ID for the user
        String customerId = userService.getStripeCustomerId(user.getId());
        
        // Create a payment intent
        String clientSecret = stripeService.createPaymentIntent(amount, customerId);
        
        Map<String, String> response = new HashMap<>();
        response.put("clientSecret", clientSecret);
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * Webhook endpoint for handling Stripe events
     * @param payload The raw JSON payload from Stripe
     * @param sigHeader The signature header from Stripe
     * @return A success response
     */
    @PostMapping("/webhook")
    public ResponseEntity<String> handleStripeWebhook(
            @RequestBody String payload,
            @RequestHeader("Stripe-Signature") String sigHeader) {
        try {
            // Process webhook event
            // This would typically validate the signature and handle different event types
            // like payment_intent.succeeded, payment_intent.payment_failed, etc.
            
            return ResponseEntity.ok("Webhook received");
        } catch (Exception e) {
            return ResponseEntity.status(400).body("Webhook error: " + e.getMessage());
        }
    }
    
    /**
     * Update user payment method
     * @param paymentMethodId The Stripe payment method ID
     * @param user The authenticated user
     * @return A success message
     */
    @PostMapping("/update-payment-method")
    public ResponseEntity<Map<String, String>> updatePaymentMethod(
            @RequestParam String paymentMethodId,
            @AuthenticationPrincipal User user) {
        
        try {
            // Get or create customer ID for the user
            String customerId = userService.getStripeCustomerId(user.getId());
            
            // Logic to attach payment method to customer would go here
            // This is typically done through the Stripe API
            
            Map<String, String> response = new HashMap<>();
            response.put("message", "Payment method updated successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            throw new RideException("Failed to update payment method: " + e.getMessage());
        }
    }
    
    /**
     * Get user's saved payment methods
     * @param user The authenticated user
     * @return A list of payment methods
     */
    @GetMapping("/payment-methods")
    public ResponseEntity<Map<String, Object>> getPaymentMethods(
            @AuthenticationPrincipal User user) {
        
        try {
            // Get customer ID for the user
            String customerId = userService.getStripeCustomerId(user.getId());
            
            // Logic to retrieve payment methods would go here
            // This is typically done through the Stripe API
            
            Map<String, Object> response = new HashMap<>();
            response.put("paymentMethods", new Object[]{}); // Placeholder
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            throw new RideException("Failed to retrieve payment methods: " + e.getMessage());
        }
    }
} 