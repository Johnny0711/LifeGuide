package com.lifeguide.api.config;

import com.lifeguide.api.model.Role;
import com.lifeguide.api.model.User;
import com.lifeguide.api.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        // 1. Ensure Admin Account exists
        if (userRepository.findByEmail("admin@lifeguide.com").isEmpty()) {
            User admin = new User();
            admin.setEmail("admin@lifeguide.com");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setRole(Role.ADMIN);
            admin.setNeedsSetup(false);
            admin.setUsername("admin");
            userRepository.save(admin);
            System.out.println("Default admin account created/restored: admin@lifeguide.com / admin123");
        }

        // 2. Migration: Ensure all users have roles (safety for existing DB records)
        try {
            userRepository.findAll().forEach(user -> {
                boolean updated = false;
                if (user.getRole() == null) {
                    user.setRole(Role.USER);
                    updated = true;
                }
                if (user.getNeedsSetup() == null) {
                    user.setNeedsSetup(false);
                    updated = true;
                }
                if (updated) {
                    userRepository.save(user);
                    System.out.println("Migrated user roles/setup for: " + user.getEmail());
                }
            });
        } catch (Exception e) {
            System.err.println("Migration failed, but proceeding to allow startup: " + e.getMessage());
        }
    }
}
