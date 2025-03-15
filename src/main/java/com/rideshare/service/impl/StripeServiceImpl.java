package com.rideshare.service.impl;

import com.rideshare.service.StripeService;
import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import com.stripe.param.PaymentIntentCreateParams;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class StripeServiceImpl implements StripeService {

    @Value("${stripe.api.key}")
    private String stripeApiKey;
    
    @Value("${stripe.api.publishable-key}")
    private String publishableKey;

    @Override
    public String createPaymentIntent(Double amount, String customerId) {
        try {
            Stripe.apiKey = stripeApiKey;
            
            long amountInCents = Math.round(amount * 100);
            
            PaymentIntentCreateParams.Builder paramsBuilder = PaymentIntentCreateParams.builder()
                    .setCurrency("usd")
                    .setAmount(amountInCents)
                    .setDescription("Ride payment");
            
            if (customerId != null && !customerId.isEmpty()) {
                paramsBuilder.setCustomer(customerId);
            }
            
            PaymentIntent paymentIntent = PaymentIntent.create(paramsBuilder.build());
            return paymentIntent.getId();
        } catch (StripeException e) {
            throw new RuntimeException("Error creating payment intent: " + e.getMessage(), e);
        }
    }

    @Override
    public String getPublishableKey() {
        return publishableKey;
    }
} 