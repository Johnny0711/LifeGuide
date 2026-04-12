package com.lifeguide.api.controller;

import com.lifeguide.api.model.Role;
import com.lifeguide.api.model.User;
import com.lifeguide.api.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final UserService userService;

    public AdminController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @PostMapping("/users")
    public ResponseEntity<Map<String, String>> createUser(@RequestBody CreateUserRequest request) {
        String tempPassword = userService.createUserByAdmin(request.getEmail(), request.getRole());
        return ResponseEntity.ok(Map.of("password", tempPassword));
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable UUID id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

    public static class CreateUserRequest {
        private String email;
        private Role role;

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public Role getRole() { return role; }
        public void setRole(Role role) { this.role = role; }
    }
}
