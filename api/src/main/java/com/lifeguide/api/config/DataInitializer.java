package com.lifeguide.api.config;

import com.lifeguide.api.model.User;
import com.lifeguide.api.model.Role;
import com.lifeguide.api.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) {
        try {
            // Ensure admin user exists
            userRepository.findByEmail("admin@lifeguide.tech").ifPresentOrElse(
                admin -> {
                    if (admin.getUsername() == null || !admin.getUsername().equals("admin")) {
                        admin.setUsername("admin");
                        userRepository.save(admin);
                        System.out.println("Admin account updated with default username 'admin'");
                    }
                },
                () -> {
                    User admin = new User();
                    admin.setEmail("admin@lifeguide.tech");
                    admin.setUsername("admin");
                    admin.setPassword(passwordEncoder.encode("admin123"));
                    admin.setRole(Role.ADMIN);
                    admin.setNeedsSetup(true);
                    userRepository.save(admin);
                    System.out.println("Default admin account created: admin@lifeguide.tech / admin123");
                }
            );
        } catch (Exception e) {
            System.err.println("Error during data initialization: " + e.getMessage());
            e.printStackTrace();
        }
    }
}
