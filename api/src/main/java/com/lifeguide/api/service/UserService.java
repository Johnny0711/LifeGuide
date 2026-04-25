package com.lifeguide.api.service;

import com.lifeguide.api.model.ShoppingList;
import com.lifeguide.api.model.User;
import com.lifeguide.api.model.Role;
import com.lifeguide.api.repository.*;
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
    private final TodoRepository todoRepository;
    private final PinRepository pinRepository;
    private final HabitRepository habitRepository;
    private final GymCardRepository gymCardRepository;
    private final FitnessLogRepository fitnessLogRepository;
    private final WorkoutSplitRepository workoutSplitRepository;
    private final ShoppingListRepository shoppingListRepository;
    private final ShoppingListInviteRepository shoppingListInviteRepository;

    public UserService(UserRepository userRepository, 
                       PasswordEncoder passwordEncoder,
                       TodoRepository todoRepository,
                       PinRepository pinRepository,
                       HabitRepository habitRepository,
                       GymCardRepository gymCardRepository,
                       FitnessLogRepository fitnessLogRepository,
                       WorkoutSplitRepository workoutSplitRepository,
                       ShoppingListRepository shoppingListRepository,
                       ShoppingListInviteRepository shoppingListInviteRepository) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.todoRepository = todoRepository;
        this.pinRepository = pinRepository;
        this.habitRepository = habitRepository;
        this.gymCardRepository = gymCardRepository;
        this.fitnessLogRepository = fitnessLogRepository;
        this.workoutSplitRepository = workoutSplitRepository;
        this.shoppingListRepository = shoppingListRepository;
        this.shoppingListInviteRepository = shoppingListInviteRepository;
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

    @Transactional
    public void deleteUser(UUID id) {
        User user = userRepository.findById(id).orElse(null);
        if (user == null) {
            return;
        }

        // Remove user from all shared shopping lists
        List<ShoppingList> sharedLists = shoppingListRepository.findSharedWithUserObj(user);
        for (ShoppingList list : sharedLists) {
            list.getSharedWith().remove(user);
            shoppingListRepository.save(list);
        }

        // Delete dependencies
        shoppingListInviteRepository.deleteBySender(user);
        shoppingListInviteRepository.deleteByRecipient(user);
        shoppingListRepository.deleteByOwner(user);
        workoutSplitRepository.deleteByUser(user);
        fitnessLogRepository.deleteByUser(user);
        gymCardRepository.deleteByUser(user);
        habitRepository.deleteByUser(user);
        pinRepository.deleteByUser(user);
        todoRepository.deleteByUser(user);

        // Delete user
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
