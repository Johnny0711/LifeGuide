package com.lifeguide.api.controller;

import com.lifeguide.api.model.User;
import com.lifeguide.api.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/sync")
    public ResponseEntity<User> syncUser(@AuthenticationPrincipal Jwt jwt) {
        String auth0Id = jwt.getSubject();
        // Claims like email and name must be requested in the Auth0 configuration payload
        String email = jwt.getClaimAsString("email");
        String name = jwt.getClaimAsString("name");

        User user = userService.syncUser(auth0Id, email, name);
        return ResponseEntity.ok(user);
    }
}
