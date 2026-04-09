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
        String email = userDetails.getUsername();
        return ResponseEntity.ok(fitnessLogService.getLogsForUser(email));
    }

    @PostMapping
    public ResponseEntity<FitnessLog> addLog(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody FitnessLogDto dto) {
        String email = userDetails.getUsername();
        return ResponseEntity.ok(fitnessLogService.addLog(email, dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<FitnessLog> updateLog(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id,
            @RequestBody FitnessLogDto dto) {
        String email = userDetails.getUsername();
        return ResponseEntity.ok(fitnessLogService.updateLog(email, id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteLog(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {
        String email = userDetails.getUsername();
        fitnessLogService.deleteLog(email, id);
        return ResponseEntity.ok().build();
    }
}
