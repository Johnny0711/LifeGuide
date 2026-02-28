package com.lifeguide.api.controller;

import com.lifeguide.api.model.Pin;
import com.lifeguide.api.service.PinService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
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
    public List<Pin> getPins(@AuthenticationPrincipal Jwt jwt) {
        return pinService.getPinsForUser(jwt.getSubject());
    }

    @PostMapping
    public Pin createPin(@AuthenticationPrincipal Jwt jwt, @RequestBody Pin pin) {
        return pinService.createPin(jwt.getSubject(), pin);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePin(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID id) {
        pinService.deletePin(jwt.getSubject(), id);
        return ResponseEntity.ok().build();
    }
}
