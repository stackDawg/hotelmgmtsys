package com.hotel.management.controller;

import com.hotel.management.dto.LoginRequest;
import com.hotel.management.dto.RegisterRequest;
import com.hotel.management.dto.UserResponse;
import com.hotel.management.entity.User;
import com.hotel.management.security.JwtTokenProvider;
import com.hotel.management.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;
    private final UserService userService;

    public AuthController(AuthenticationManager authenticationManager,
                         JwtTokenProvider jwtTokenProvider,
                         UserService userService) {
        this.authenticationManager = authenticationManager;
        this.jwtTokenProvider = jwtTokenProvider;
        this.userService = userService;
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@Valid @RequestBody LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequest.getUsername(),
                        loginRequest.getPassword()
                )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        User user = (User) authentication.getPrincipal();
        
        // Update last login date
        userService.updateLastLoginDate(user.getUsername());
        
        String token = jwtTokenProvider.createToken(user);
        
        Map<String, Object> response = new HashMap<>();
        response.put("token", token);
        response.put("user", new UserResponse(user));
        
        return ResponseEntity.ok(response);
    }

    @PostMapping("/register")
    public ResponseEntity<UserResponse> register(@Valid @RequestBody RegisterRequest registerRequest) {
        // Create user entity from DTO
        User user = new User();
        user.setUsername(registerRequest.getUsername());
        user.setPassword(registerRequest.getPassword());
        user.setEmail(registerRequest.getEmail());
        user.setName(registerRequest.getName());
        user.setPhone(registerRequest.getPhone());
        user.setRole(registerRequest.getRole());
        user.setEnabled(true);
        
        User createdUser = userService.registerUser(user);
        
        return new ResponseEntity<>(new UserResponse(createdUser), HttpStatus.CREATED);
    }

    @GetMapping("/me")
    public ResponseEntity<UserResponse> getCurrentUser(Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        
        User user = (User) authentication.getPrincipal();
        return ResponseEntity.ok(new UserResponse(user));
    }
}