package com.lifeguide.api.controller;

import com.lifeguide.api.dto.FitnessLogDto;
import com.lifeguide.api.model.FitnessLog;
import com.lifeguide.api.service.FitnessLogService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
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
    public ResponseEntity<List<FitnessLog>> getLogs(@AuthenticationPrincipal UserDetails userDetails) {
        String auth0Id = userDetails.getUsername();
        return ResponseEntity.ok(fitnessLogService.getLogsForUser(auth0Id));
    }

    @PostMapping
    public ResponseEntity<FitnessLog> addLog(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody FitnessLogDto dto) {
        String auth0Id = userDetails.getUsername();
        return ResponseEntity.ok(fitnessLogService.addLog(auth0Id, dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<FitnessLog> updateLog(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id,
            @RequestBody FitnessLogDto dto) {
        String auth0Id = userDetails.getUsername();
        return ResponseEntity.ok(fitnessLogService.updateLog(auth0Id, id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteLog(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {
        String auth0Id = userDetails.getUsername();
        fitnessLogService.deleteLog(auth0Id, id);
        return ResponseEntity.ok().build();
    }
}
