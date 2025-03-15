package com.rideshare.service;

import com.stripe.Stripe;
import com.stripe.model.PaymentIntent;
import com.stripe.param.PaymentIntentCreateParams;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

public interface StripeService {
    String createPaymentIntent(Double amount, String customerId);
    String getPublishableKey();
}

@Service
public class StripeServiceImpl implements StripeService {

    @Value("${stripe.api.key}")
    private String stripeApiKey;

    public String createPaymentIntent(Double amount, String customerId) {
        try {
            Stripe.apiKey = stripeApiKey;

            PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                .setAmount(amount.multiply(new BigDecimal(100)).longValue()) // Convert to cents
                .setCurrency("usd")
                .setCustomer(customerId)
                .setAutomaticPaymentMethods(
                    PaymentIntentCreateParams.AutomaticPaymentMethods.builder()
                        .setEnabled(true)
                        .build()
                )
                .build();

            PaymentIntent paymentIntent = PaymentIntent.create(params);
            return paymentIntent.getId();
        } catch (Exception e) {
            throw new RuntimeException("Error creating payment intent: " + e.getMessage());
        }
    }

    @Override
    public String getPublishableKey() {
        // Implementation needed
        throw new UnsupportedOperationException("Method not implemented");
    }
} 