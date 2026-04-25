package com.lifeguide.api.controller;

import com.lifeguide.api.model.Exercise;
import com.lifeguide.api.model.WorkoutSplit;
import com.lifeguide.api.service.WorkoutService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/workouts")
public class WorkoutController {

    private final WorkoutService workoutService;

    public WorkoutController(WorkoutService workoutService) {
        this.workoutService = workoutService;
    }

    // DEBUG: ping endpoint to test if auth works for this path
    @GetMapping("/ping")
    public String ping(@AuthenticationPrincipal UserDetails userDetails) {
        return "pong - user: " + (userDetails != null ? userDetails.getUsername() : "NULL");
    }

    @GetMapping
    public ResponseEntity<?> getWorkouts(@AuthenticationPrincipal UserDetails userDetails) {
        try {
            System.out.println("DEBUG: GET /api/workouts hit for user: " + userDetails.getUsername());
            List<WorkoutSplit> splits = workoutService.getWorkoutsForUser(userDetails.getUsername());
            return ResponseEntity.ok(splits);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error fetching workouts: " + e.getClass().getName() + " - " + e.getMessage());
        }
    }

    @PostMapping
    public WorkoutSplit createSplit(@AuthenticationPrincipal UserDetails userDetails, @RequestBody WorkoutSplit split) {
        return workoutService.createSplit(userDetails.getUsername(), split);
    }

    @PutMapping("/{id}")
    public WorkoutSplit updateSplit(@AuthenticationPrincipal UserDetails userDetails, @PathVariable UUID id, @RequestBody WorkoutSplit updates) {
        return workoutService.updateSplit(userDetails.getUsername(), id, updates);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSplit(@AuthenticationPrincipal UserDetails userDetails, @PathVariable UUID id) {
        workoutService.deleteSplit(userDetails.getUsername(), id);
        return ResponseEntity.ok().build();
    }

    // --- EXERCISES ---

    @PostMapping("/{splitId}/exercises")
    public Exercise addExercise(@AuthenticationPrincipal UserDetails userDetails, @PathVariable UUID splitId, @RequestBody Exercise exercise) {
        return workoutService.addExercise(userDetails.getUsername(), splitId, exercise);
    }

    @PutMapping("/{splitId}/exercises/{exerciseId}")
    public Exercise updateExercise(@AuthenticationPrincipal UserDetails userDetails, @PathVariable UUID splitId, @PathVariable UUID exerciseId, @RequestBody Exercise updates) {
        return workoutService.updateExercise(userDetails.getUsername(), splitId, exerciseId, updates);
    }

    @DeleteMapping("/{splitId}/exercises/{exerciseId}")
    public ResponseEntity<Void> deleteExercise(@AuthenticationPrincipal UserDetails userDetails, @PathVariable UUID splitId, @PathVariable UUID exerciseId) {
        workoutService.deleteExercise(userDetails.getUsername(), splitId, exerciseId);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/{splitId}/exercises/reorder")
    public ResponseEntity<Void> reorderExercises(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable UUID splitId,
            @RequestBody List<UUID> orderedIds) {
        workoutService.reorderExercises(userDetails.getUsername(), splitId, orderedIds);
        return ResponseEntity.ok().build();
    }
}
