package com.rideshare.service;

public interface StripeService {
    String createPaymentIntent(Double amount, String customerId);
    String getPublishableKey();
} 