package com.lifeguide.api.config;

import com.lifeguide.api.model.User;
import com.lifeguide.api.model.Role;
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
    public void run(String... args) {
        if (userRepository.count() == 0) {
            User admin = new User();
            admin.setEmail("admin@lifeguide.tech");
            admin.setUsername("admin"); // Default username for easier login
            admin.setPassword(passwordEncoder.encode("admin123")); // Default password
            admin.setRole(Role.ADMIN);
            admin.setNeedsSetup(true); // Forces password change on first login
            userRepository.save(admin);
            System.out.println("Default admin account created:");
            System.out.println("Email: admin@lifeguide.tech");
            System.out.println("Username: admin");
            System.out.println("Password: admin123");
        }
    }
}
