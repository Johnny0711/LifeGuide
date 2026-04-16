package com.lifeguide.api.service;

import com.lifeguide.api.model.GymCard;
import com.lifeguide.api.model.User;
import com.lifeguide.api.repository.GymCardRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.UUID;

@Service
@Transactional
public class GymCardService {

    private final GymCardRepository gymCardRepository;
    private final UserService userService;

    public GymCardService(GymCardRepository gymCardRepository, UserService userService) {
        this.gymCardRepository = gymCardRepository;
        this.userService = userService;
    }

    @Transactional(readOnly = true)
    public Optional<GymCard> getCardForUser(String email) {
        return gymCardRepository.findByUser_Email(email);
    }

    public GymCard saveOrUpdateCard(String email, GymCard cardData) {
        User user = userService.getUserByEmail(email);
        
        Optional<GymCard> existingCard = gymCardRepository.findByUser_Email(email);
        GymCard cardToSave = existingCard.orElse(new GymCard());
        
        cardToSave.setUser(user);
        cardToSave.setGymName(cardData.getGymName());
        cardToSave.setBarcodeValue(cardData.getBarcodeValue());
        
        if (cardData.getColorTheme() != null) {
            cardToSave.setColorTheme(cardData.getColorTheme());
        } else if (existingCard.isEmpty()) {
            cardToSave.setColorTheme("#000000"); // default
        }

        return gymCardRepository.saveAndFlush(cardToSave);
    }

    public void deleteCard(String email) {
        gymCardRepository.findByUser_Email(email).ifPresent(card -> {
            gymCardRepository.delete(card);
            gymCardRepository.flush();
        });
    }
}
