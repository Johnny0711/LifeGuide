package com.lifeguide.api.controller;

import com.lifeguide.api.model.Pin;
import com.lifeguide.api.service.PinService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/pins")
public class PinController {

    private final PinService pinService;

    public PinController(PinService pinService) {
        this.pinService = pinService;
    }

    @GetMapping
    public List<Pin> getPins(@AuthenticationPrincipal UserDetails userDetails) {
        return pinService.getPinsForUser(userDetails.getUsername());
    }

    @PostMapping
    public Pin createPin(@AuthenticationPrincipal UserDetails userDetails, @RequestBody Pin pin) {
        return pinService.createPin(userDetails.getUsername(), pin);
    }

    @PutMapping("/{id}")
    public Pin updatePin(@AuthenticationPrincipal UserDetails userDetails, @PathVariable UUID id, @RequestBody Pin updates) {
        return pinService.updatePin(userDetails.getUsername(), id, updates);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePin(@AuthenticationPrincipal UserDetails userDetails, @PathVariable UUID id) {
        pinService.deletePin(userDetails.getUsername(), id);
        return ResponseEntity.ok().build();
    }
}
