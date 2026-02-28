package com.lifeguide.api.controller;

import com.lifeguide.api.model.Exercise;
import com.lifeguide.api.model.WorkoutSplit;
import com.lifeguide.api.service.WorkoutService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
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

    @GetMapping
    public List<WorkoutSplit> getWorkouts(@AuthenticationPrincipal Jwt jwt) {
        return workoutService.getWorkoutsForUser(jwt.getSubject());
    }

    @PostMapping
    public WorkoutSplit createSplit(@AuthenticationPrincipal Jwt jwt, @RequestBody WorkoutSplit split) {
        return workoutService.createSplit(jwt.getSubject(), split);
    }

    @PutMapping("/{id}")
    public WorkoutSplit updateSplit(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID id, @RequestBody WorkoutSplit updates) {
        return workoutService.updateSplit(jwt.getSubject(), id, updates);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSplit(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID id) {
        workoutService.deleteSplit(jwt.getSubject(), id);
        return ResponseEntity.ok().build();
    }

    // --- EXERCISES ---

    @PostMapping("/{splitId}/exercises")
    public Exercise addExercise(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID splitId, @RequestBody Exercise exercise) {
        return workoutService.addExercise(jwt.getSubject(), splitId, exercise);
    }

    @PutMapping("/{splitId}/exercises/{exerciseId}")
    public Exercise updateExercise(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID splitId, @PathVariable UUID exerciseId, @RequestBody Exercise updates) {
        return workoutService.updateExercise(jwt.getSubject(), splitId, exerciseId, updates);
    }

    @DeleteMapping("/{splitId}/exercises/{exerciseId}")
    public ResponseEntity<Void> deleteExercise(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID splitId, @PathVariable UUID exerciseId) {
        workoutService.deleteExercise(jwt.getSubject(), splitId, exerciseId);
        return ResponseEntity.ok().build();
    }
}
