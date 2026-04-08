package com.lifeguide.api.service;

import com.lifeguide.api.model.User;
import com.lifeguide.api.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public User registerUser(String email, String password, String name) {
        if (userRepository.findByEmail(email).isPresent()) {
            throw new RuntimeException("Email already exists");
        }
        User user = new User();
        user.setEmail(email);
        user.setPassword(password);
        user.setName(name);
        return userRepository.save(user);
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
}
