package com.lifeguide.api.controller;

import com.lifeguide.api.model.Habit;
import com.lifeguide.api.service.HabitService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
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
    public List<Habit> getHabits(@AuthenticationPrincipal UserDetails userDetails) {
        return habitService.getHabitsForUser(userDetails.getUsername());
    }

    @PostMapping
    public Habit createHabit(@AuthenticationPrincipal UserDetails userDetails, @RequestBody Habit habit) {
        return habitService.createHabit(userDetails.getUsername(), habit);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteHabit(@AuthenticationPrincipal UserDetails userDetails, @PathVariable UUID id) {
        habitService.deleteHabit(userDetails.getUsername(), id);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}/toggle")
    public Habit toggleCompletion(
            @AuthenticationPrincipal UserDetails userDetails, 
            @PathVariable UUID id, 
            @RequestParam String date) {
        // Date mapping expected as ISO format yyyy-MM-dd
        return habitService.toggleCompletion(userDetails.getUsername(), id, LocalDate.parse(date));
    }

    @PutMapping("/{id}")
    public Habit updateHabit(@AuthenticationPrincipal UserDetails userDetails, @PathVariable UUID id, @RequestBody Habit habit) {
        return habitService.updateHabit(userDetails.getUsername(), id, habit);
    }
}
