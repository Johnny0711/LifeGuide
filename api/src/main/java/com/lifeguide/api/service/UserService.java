package com.lifeguide.api.service;

import com.lifeguide.api.model.User;
import com.lifeguide.api.model.Role;
import com.lifeguide.api.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.util.List;
import java.util.UUID;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }


    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @Transactional
    public User updateUserProfile(String email, com.lifeguide.api.dto.ProfileUpdateDto dto) {
        User user = getUserByEmail(email);
        
        if (dto.getUsername() != null) user.setUsername(dto.getUsername());
        if (dto.getAge() != null) user.setAge(dto.getAge());
        if (dto.getHeightCm() != null) user.setHeightCm(dto.getHeightCm());
        if (dto.getCurrentWeightKg() != null) user.setCurrentWeightKg(dto.getCurrentWeightKg());
        
        return userRepository.save(user);
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public void deleteUser(UUID id) {
        userRepository.deleteById(id);
    }

    @Transactional
    public String createUserByAdmin(String email, Role role) {
        if (userRepository.findByEmail(email).isPresent()) {
            throw new RuntimeException("Email already exists");
        }
        
        String tempPassword = generateRandomPassword(12);
        User user = new User();
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(tempPassword));
        user.setRole(role);
        user.setNeedsSetup(true);
        userRepository.save(user);
        
        return tempPassword;
    }

    @Transactional
    public void setupAccount(String email, String username, String newPassword) {
        User user = getUserByEmail(email);
        if (!user.getNeedsSetup()) {
            throw new RuntimeException("Account already setup");
        }
        
        if (newPassword.length() < 8 || !newPassword.matches(".*[a-zA-Z].*") || !newPassword.matches(".*[0-9].*")) {
            throw new RuntimeException("Password must be at least 8 characters long and contain both letters and numbers");
        }

        user.setUsername(username);
        user.setPassword(passwordEncoder.encode(newPassword));
        user.setNeedsSetup(false);
        userRepository.save(user);
    }

    private String generateRandomPassword(int length) {
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()";
        SecureRandom random = new SecureRandom();
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < length; i++) {
            sb.append(chars.charAt(random.nextInt(chars.length())));
        }
        return sb.toString();
    }
}
