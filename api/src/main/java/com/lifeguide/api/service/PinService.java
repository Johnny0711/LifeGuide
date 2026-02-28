package com.lifeguide.api.service;

import com.lifeguide.api.model.Pin;
import com.lifeguide.api.model.User;
import com.lifeguide.api.repository.PinRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class PinService {

    private final PinRepository pinRepository;
    private final UserService userService;

    public PinService(PinRepository pinRepository, UserService userService) {
        this.pinRepository = pinRepository;
        this.userService = userService;
    }

    public List<Pin> getPinsForUser(String auth0Id) {
        return pinRepository.findByUserAuth0IdOrderByCreatedAtDesc(auth0Id);
    }

    public Pin createPin(String auth0Id, Pin pinData) {
        User user = userService.getUserByAuth0Id(auth0Id);
        pinData.setUser(user);
        return pinRepository.save(pinData);
    }

    public void deletePin(String auth0Id, UUID pinId) {
        Pin pin = pinRepository.findById(pinId)
                .orElseThrow(() -> new RuntimeException("Pin not found"));
        // Ensure the user actually owns this pin
        if (!pin.getUser().getAuth0Id().equals(auth0Id)) {
            throw new RuntimeException("Unauthorized to delete this pin");
        }
        pinRepository.delete(pin);
    }
}
