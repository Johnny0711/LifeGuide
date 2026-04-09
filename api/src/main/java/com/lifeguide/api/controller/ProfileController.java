package com.lifeguide.api.controller;

import com.lifeguide.api.dto.ProfileUpdateDto;
import com.lifeguide.api.model.User;
import com.lifeguide.api.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/profile")
public class ProfileController {

    private final UserService userService;

    public ProfileController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    public ResponseEntity<User> getProfile(@AuthenticationPrincipal UserDetails userDetails) {
        String email = userDetails.getUsername();
        User user = userService.getUserByEmail(email);
        return ResponseEntity.ok(user);
    }

    @PutMapping
    public ResponseEntity<User> updateProfile(@AuthenticationPrincipal UserDetails userDetails, @RequestBody ProfileUpdateDto updateDto) {
        String email = userDetails.getUsername();
        User updatedUser = userService.updateUserProfile(email, updateDto);
        return ResponseEntity.ok(updatedUser);
    }
}
