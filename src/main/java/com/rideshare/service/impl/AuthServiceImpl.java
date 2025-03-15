package com.rideshare.service.impl;

import com.rideshare.dto.AuthResponse;
import com.rideshare.dto.LoginRequest;
import com.rideshare.dto.RegisterRequest;
import com.rideshare.model.User;
import com.rideshare.repository.UserRepository;
import com.rideshare.service.AuthService;
import com.rideshare.service.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    @Override
    public AuthResponse register(RegisterRequest request) {
        // Check if user already exists
        if (userRepository.findByEmail(request.getEmail()) != null) {
            throw new RuntimeException("User with this email already exists");
        }

        // Create new user
        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(request.getRole());
        
        // Save user to database
        User savedUser = userRepository.save(user);
        
        // Generate JWT token
        String token = jwtService.generateToken(savedUser);
        
        // Return auth response
        return AuthResponse.builder()
                .token(token)
                .message("User registered successfully")
                .userType(savedUser.getRole().toString())
                .userId(savedUser.getId())
                .build();
    }

    @Override
    public AuthResponse login(LoginRequest request) {
        // Find user by email
        User user = userRepository.findByEmail(request.getEmail());
        
        // Check if user exists and password matches
        if (user == null || !passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new BadCredentialsException("Invalid email or password");
        }
        
        // Generate JWT token
        String token = jwtService.generateToken(user);
        
        // Return auth response
        return AuthResponse.builder()
                .token(token)
                .message("Login successful")
                .userType(user.getRole().toString())
                .userId(user.getId())
                .build();
    }
} 