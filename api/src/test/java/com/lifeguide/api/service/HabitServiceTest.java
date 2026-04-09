package com.lifeguide.api.service;

import com.lifeguide.api.model.Habit;
import com.lifeguide.api.model.User;
import com.lifeguide.api.repository.HabitRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class HabitServiceTest {

    @Mock
    private HabitRepository habitRepository;

    @Mock
    private UserService userService;

    @InjectMocks
    private HabitService habitService;

    private User mockUser;
    private Habit mockHabit;

    @BeforeEach
    void setUp() {
        mockUser = new User();
        mockUser.setEmail("test@example.com");

        mockHabit = new Habit();
        mockHabit.setId(UUID.randomUUID());
        mockHabit.setUser(mockUser);
        mockHabit.setCompletedDates(new ArrayList<>());
    }

    @Test
    void testCalculateStreaks_NoCompletions() {
        when(habitRepository.findByUserEmailOrderByCreatedAtAsc("test@example.com"))
                .thenReturn(List.of(mockHabit));

        List<Habit> results = habitService.getHabitsForUser("test@example.com");
        
        assertEquals(1, results.size());
        assertEquals(0, results.get(0).getCurrentStreak());
        assertEquals(0, results.get(0).getLongestStreak());
    }

    @Test
    void testCalculateStreaks_ConsecutiveDays() {
        LocalDate today = LocalDate.now();
        mockHabit.setCompletedDates(new ArrayList<>(Arrays.asList(
                today.minusDays(2),
                today.minusDays(1),
                today
        )));

        when(habitRepository.findByUserEmailOrderByCreatedAtAsc("test@example.com"))
                .thenReturn(List.of(mockHabit));

        List<Habit> results = habitService.getHabitsForUser("test@example.com");
        
        assertEquals(3, results.get(0).getCurrentStreak());
        assertEquals(3, results.get(0).getLongestStreak());
    }

    @Test
    void testCalculateStreaks_BrokenStreak() {
        LocalDate today = LocalDate.now();
        mockHabit.setCompletedDates(new ArrayList<>(Arrays.asList(
                today.minusDays(5), // streak 1
                today.minusDays(4), // streak 2
                today.minusDays(3), // streak 3
                today.minusDays(1), // new streak 1
                today               // new streak 2
        )));

        when(habitRepository.findByUserEmailOrderByCreatedAtAsc("test@example.com"))
                .thenReturn(List.of(mockHabit));

        List<Habit> results = habitService.getHabitsForUser("test@example.com");
        
        assertEquals(2, results.get(0).getCurrentStreak());
        assertEquals(3, results.get(0).getLongestStreak());
    }

    @Test
    void testToggleCompletion_AddsDate() {
        LocalDate today = LocalDate.now();
        when(habitRepository.findById(mockHabit.getId())).thenReturn(Optional.of(mockHabit));
        when(habitRepository.save(any(Habit.class))).thenReturn(mockHabit);

        Habit result = habitService.toggleCompletion("test@example.com", mockHabit.getId(), today);
        
        assertEquals(1, result.getCompletedDates().size());
        assertEquals(today, result.getCompletedDates().get(0));
        assertEquals(1, result.getCurrentStreak());
    }
}
