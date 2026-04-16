package com.lifeguide.api.controller;

import com.lifeguide.api.model.GymCard;
import com.lifeguide.api.service.GymCardService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/gym-cards")
public class GymCardController {

    private final GymCardService gymCardService;

    public GymCardController(GymCardService gymCardService) {
        this.gymCardService = gymCardService;
    }

    @GetMapping
    public ResponseEntity<GymCard> getMyCard(@AuthenticationPrincipal UserDetails userDetails) {
        return gymCardService.getCardForUser(userDetails.getUsername())
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.noContent().build());
    }

    @PostMapping
    public ResponseEntity<GymCard> saveCard(@AuthenticationPrincipal UserDetails userDetails, @RequestBody GymCard gymCard) {
        return ResponseEntity.ok(gymCardService.saveOrUpdateCard(userDetails.getUsername(), gymCard));
    }

    @DeleteMapping
    public ResponseEntity<Void> deleteCard(@AuthenticationPrincipal UserDetails userDetails) {
        gymCardService.deleteCard(userDetails.getUsername());
        return ResponseEntity.ok().build();
    }
}
