package com.lifeguide.api.controller;

import com.lifeguide.api.model.Habit;
import com.lifeguide.api.service.HabitService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/habits")
public class HabitController {

    private final HabitService habitService;

    public HabitController(HabitService habitService) {
        this.habitService = habitService;
    }

    @GetMapping
    public List<Habit> getHabits(@AuthenticationPrincipal Jwt jwt) {
        return habitService.getHabitsForUser(jwt.getSubject());
    }

    @PostMapping
    public Habit createHabit(@AuthenticationPrincipal Jwt jwt, @RequestBody Habit habit) {
        return habitService.createHabit(jwt.getSubject(), habit);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteHabit(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID id) {
        habitService.deleteHabit(jwt.getSubject(), id);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}/toggle")
    public Habit toggleCompletion(
            @AuthenticationPrincipal Jwt jwt, 
            @PathVariable UUID id, 
            @RequestParam String date) {
        // Date mapping expected as ISO format yyyy-MM-dd
        return habitService.toggleCompletion(jwt.getSubject(), id, LocalDate.parse(date));
    }

    @PutMapping("/{id}")
    public Habit updateHabit(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID id, @RequestBody Habit habit) {
        return habitService.updateHabit(jwt.getSubject(), id, habit);
    }
}
