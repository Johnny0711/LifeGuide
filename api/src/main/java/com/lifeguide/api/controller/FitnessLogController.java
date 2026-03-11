package com.lifeguide.api.controller;

import com.lifeguide.api.dto.FitnessLogDto;
import com.lifeguide.api.model.FitnessLog;
import com.lifeguide.api.service.FitnessLogService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/fitness-logs")
public class FitnessLogController {

    private final FitnessLogService fitnessLogService;

    public FitnessLogController(FitnessLogService fitnessLogService) {
        this.fitnessLogService = fitnessLogService;
    }

    @GetMapping
    public ResponseEntity<List<FitnessLog>> getLogs(@AuthenticationPrincipal Jwt jwt) {
        String auth0Id = jwt.getSubject();
        return ResponseEntity.ok(fitnessLogService.getLogsForUser(auth0Id));
    }

    @PostMapping
    public ResponseEntity<FitnessLog> addLog(
            @AuthenticationPrincipal Jwt jwt,
            @RequestBody FitnessLogDto dto) {
        String auth0Id = jwt.getSubject();
        return ResponseEntity.ok(fitnessLogService.addLog(auth0Id, dto));
    }
}
