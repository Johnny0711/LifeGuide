package com.lifeguide.api.service;

import com.lifeguide.api.model.Pin;
import com.lifeguide.api.model.User;
import com.lifeguide.api.repository.PinRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class PinService {

    private final PinRepository pinRepository;
    private final UserService userService;

    public PinService(PinRepository pinRepository, UserService userService) {
        this.pinRepository = pinRepository;
        this.userService = userService;
    }

    public List<Pin> getPinsForUser(String email) {
        return pinRepository.findByUserEmailOrderByCreatedAtDesc(email);
    }

    public Pin createPin(String email, Pin pinData) {
        User user = userService.getUserByEmail(email);
        pinData.setUser(user);
        return pinRepository.save(pinData);
    }

    public Pin updatePin(String email, UUID pinId, Pin updates) {
        Pin pin = pinRepository.findById(pinId)
                .orElseThrow(() -> new RuntimeException("Pin not found"));
        if (!pin.getUser().getEmail().equals(email)) {
            throw new RuntimeException("Unauthorized to update this pin");
        }
        if (updates.getTitle() != null) pin.setTitle(updates.getTitle());
        if (updates.getContent() != null) pin.setContent(updates.getContent());
        if (updates.getColor() != null) pin.setColor(updates.getColor());
        return pinRepository.save(pin);
    }

    public void deletePin(String email, UUID pinId) {
        Pin pin = pinRepository.findById(pinId)
                .orElseThrow(() -> new RuntimeException("Pin not found"));
        // Ensure the user actually owns this pin
        if (!pin.getUser().getEmail().equals(email)) {
            throw new RuntimeException("Unauthorized to delete this pin");
        }
        pinRepository.delete(pin);
    }
}
