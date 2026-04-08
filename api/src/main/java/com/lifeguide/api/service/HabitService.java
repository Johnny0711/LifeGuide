package com.lifeguide.api.service;

import com.lifeguide.api.model.Habit;
import com.lifeguide.api.model.User;
import com.lifeguide.api.repository.HabitRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.Collections;

@Service
@Transactional
public class HabitService {

    private final HabitRepository habitRepository;
    private final UserService userService;

    public HabitService(HabitRepository habitRepository, UserService userService) {
        this.habitRepository = habitRepository;
        this.userService = userService;
    }

    public List<Habit> getHabitsForUser(String email) {
        List<Habit> habits = habitRepository.findByUserEmailOrderByCreatedAtAsc(email);
        // Recalculate streaks dynamically when fetching
        habits.forEach(this::calculateStreaks);
        return habits;
    }

    public Habit createHabit(String email, Habit habitData) {
        User user = userService.getUserByEmail(email);
        habitData.setUser(user);
        habitData.setCompletedDates(habitData.getCompletedDates() == null ? new java.util.ArrayList<>() : habitData.getCompletedDates());
        return habitRepository.save(habitData);
    }

    public void deleteHabit(String email, UUID habitId) {
        Habit habit = getOwnedHabit(email, habitId);
        habitRepository.delete(habit);
    }

    @Transactional
    public Habit toggleCompletion(String email, UUID habitId, LocalDate date) {
        Habit habit = getOwnedHabit(email, habitId);
        List<LocalDate> dates = habit.getCompletedDates();
        
        if (dates.contains(date)) {
            dates.remove(date);
        } else {
            dates.add(date);
        }
        
        calculateStreaks(habit);
        return habitRepository.save(habit);
    }

    public Habit updateHabit(String email, UUID habitId, Habit updates) {
        Habit habit = getOwnedHabit(email, habitId);
        if (updates.getTitle() != null) habit.setTitle(updates.getTitle());
        if (updates.getIcon() != null) habit.setIcon(updates.getIcon());
        if (updates.getColor() != null) habit.setColor(updates.getColor());
        return habitRepository.save(habit);
    }

    private Habit getOwnedHabit(String email, UUID habitId) {
        Habit habit = habitRepository.findById(habitId)
                .orElseThrow(() -> new RuntimeException("Habit not found"));
        if (!habit.getUser().getEmail().equals(email)) {
            throw new RuntimeException("Unauthorized");
        }
        return habit;
    }

    private void calculateStreaks(Habit habit) {
        List<LocalDate> dates = habit.getCompletedDates();
        if (dates == null || dates.isEmpty()) {
            habit.setCurrentStreak(0);
            habit.setLongestStreak(0);
            return;
        }

        Collections.sort(dates);
        
        int currentStreak = 0;
        int maxStreak = 0;
        int tempStreak = 1;

        for (int i = 1; i < dates.size(); i++) {
            if (dates.get(i).minusDays(1).equals(dates.get(i - 1))) {
                tempStreak++;
            } else if (!dates.get(i).equals(dates.get(i - 1))) {
                maxStreak = Math.max(maxStreak, tempStreak);
                tempStreak = 1;
            }
        }
        maxStreak = Math.max(maxStreak, tempStreak);

        // Current streak logic
        LocalDate today = LocalDate.now();
        LocalDate yesterday = today.minusDays(1);
        
        if (dates.contains(today)) {
            currentStreak = getConsecutiveCountBackwards(dates, today);
        } else if (dates.contains(yesterday)) {
            currentStreak = getConsecutiveCountBackwards(dates, yesterday);
        } else {
            currentStreak = 0;
        }

        habit.setCurrentStreak(currentStreak);
        habit.setLongestStreak(Math.max(maxStreak, habit.getLongestStreak()));
    }

    private int getConsecutiveCountBackwards(List<LocalDate> dates, LocalDate start) {
        int count = 1;
        LocalDate current = start.minusDays(1);
        while (dates.contains(current)) {
            count++;
            current = current.minusDays(1);
        }
        return count;
    }
}
