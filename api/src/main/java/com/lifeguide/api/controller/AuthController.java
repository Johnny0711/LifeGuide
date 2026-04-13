package com.lifeguide.api.controller;

import com.lifeguide.api.model.User;
import com.lifeguide.api.security.JwtService;
import com.lifeguide.api.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.core.AuthenticationException;
import org.springframework.context.annotation.Lazy;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UserService userService;
    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;
    private final PasswordEncoder passwordEncoder;

    public AuthController(AuthenticationManager authenticationManager, UserService userService, JwtService jwtService, @Lazy UserDetailsService userDetailsService, PasswordEncoder passwordEncoder) {
        this.authenticationManager = authenticationManager;
        this.userService = userService;
        this.jwtService = jwtService;
        this.userDetailsService = userDetailsService;
        this.passwordEncoder = passwordEncoder;
    }

    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthRequest request) {
        logger.info("Login attempt for email: {}", request.getEmail());
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
            );
            UserDetails userDetails = userDetailsService.loadUserByUsername(request.getEmail());
            String jwtToken = jwtService.generateToken(userDetails);
            return ResponseEntity.ok(new AuthResponse(jwtToken));
        } catch (AuthenticationException e) {
            logger.error("Authentication failed for {}: {}", request.getEmail(), e.getMessage());
            return ResponseEntity.status(401).body(new ErrorResponse("Ungültige E-Mail oder Passwort"));
        } catch (Exception e) {
            logger.error("Unexpected error during login: ", e);
            return ResponseEntity.status(500).body(new ErrorResponse("Ein unerwarteter Fehler ist aufgetreten"));
        }
    }

    @PostMapping("/setup-account")
    public ResponseEntity<Void> setupAccount(@RequestBody SetupRequest request, java.security.Principal principal) {
        if (!request.getPassword().equals(request.getPasswordConfirm())) {
            throw new RuntimeException("Passwords do not match");
        }
        userService.setupAccount(principal.getName(), request.getUsername(), request.getPassword());
        return ResponseEntity.ok().build();
    }
    
    // DTOs
    public static class AuthRequest {
        private String email;
        private String password;
        
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
    }

    public static class SetupRequest {
        private String username;
        private String password;
        private String passwordConfirm;
        
        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
        public String getPasswordConfirm() { return passwordConfirm; }
        public void setPasswordConfirm(String passwordConfirm) { this.passwordConfirm = passwordConfirm; }
    }

    public static class AuthResponse {
        private String token;
        
        public AuthResponse() {}
        public AuthResponse(String token) { this.token = token; }
        
        public String getToken() { return token; }
        public void setToken(String token) { this.token = token; }
    }

    public static class ErrorResponse {
        private String message;
        public ErrorResponse(String message) { this.message = message; }
        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
    }
}
