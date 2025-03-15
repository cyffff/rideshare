package com.rideshare.service;

import com.rideshare.model.User;

public interface JwtService {
    String generateToken(User user);
    String extractUsername(String token);
    boolean isTokenValid(String token, User user);
} 