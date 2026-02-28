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

    @Transactional
    public User syncUser(String auth0Id, String email, String name) {
        return userRepository.findByAuth0Id(auth0Id)
                .map(user -> {
                    // Update user info if it changed
                    if (email != null) user.setEmail(email);
                    if (name != null) user.setName(name);
                    return userRepository.save(user);
                })
                .orElseGet(() -> {
                    // Create new user explicitly referencing OOP domain creation
                    User newUser = new User();
                    newUser.setAuth0Id(auth0Id);
                    newUser.setEmail(email != null ? email : "");
                    newUser.setName(name);
                    return userRepository.save(newUser);
                });
    }

    public User getUserByAuth0Id(String auth0Id) {
        return userRepository.findByAuth0Id(auth0Id)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}
