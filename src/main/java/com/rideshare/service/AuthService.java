package com.rideshare.service;

import com.rideshare.dto.AuthResponse;
import com.rideshare.dto.LoginRequest;
import com.rideshare.dto.RegisterRequest;

public interface AuthService {
    AuthResponse register(RegisterRequest request);
    AuthResponse login(LoginRequest request);
} 