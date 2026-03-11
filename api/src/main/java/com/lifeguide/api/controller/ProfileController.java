package com.lifeguide.api.controller;

import com.lifeguide.api.dto.ProfileUpdateDto;
import com.lifeguide.api.model.User;
import com.lifeguide.api.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/profile")
public class ProfileController {

    private final UserService userService;

    public ProfileController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    public ResponseEntity<User> getProfile(@AuthenticationPrincipal Jwt jwt) {
        String auth0Id = jwt.getSubject();
        User user = userService.getUserByAuth0Id(auth0Id);
        return ResponseEntity.ok(user);
    }

    @PutMapping
    public ResponseEntity<User> updateProfile(@AuthenticationPrincipal Jwt jwt, @RequestBody ProfileUpdateDto updateDto) {
        String auth0Id = jwt.getSubject();
        User updatedUser = userService.updateUserProfile(auth0Id, updateDto);
        return ResponseEntity.ok(updatedUser);
    }
}
