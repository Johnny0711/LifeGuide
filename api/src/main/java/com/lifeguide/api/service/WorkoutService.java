package com.lifeguide.api.service;

import com.lifeguide.api.model.Exercise;
import com.lifeguide.api.model.User;
import com.lifeguide.api.model.WorkoutSplit;
import com.lifeguide.api.repository.ExerciseRepository;
import com.lifeguide.api.repository.WorkoutSplitRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class WorkoutService {

    private final WorkoutSplitRepository workoutSplitRepository;
    private final ExerciseRepository exerciseRepository;
    private final UserService userService;

    public WorkoutService(WorkoutSplitRepository workoutSplitRepository, ExerciseRepository exerciseRepository, UserService userService) {
        this.workoutSplitRepository = workoutSplitRepository;
        this.exerciseRepository = exerciseRepository;
        this.userService = userService;
    }

    @Transactional(readOnly = true)
    public List<WorkoutSplit> getWorkoutsForUser(String email) {
        return workoutSplitRepository.findByUser_EmailOrderByCreatedAtAsc(email);
    }

    @Transactional
    public WorkoutSplit createSplit(String email, WorkoutSplit splitData) {
        User user = userService.getUserByEmail(email);
        splitData.setUser(user);
        if (splitData.getExercises() != null) {
            splitData.getExercises().forEach(e -> e.setWorkoutSplit(splitData));
        }
        return workoutSplitRepository.saveAndFlush(splitData);
    }

    @Transactional
    public WorkoutSplit updateSplit(String email, UUID splitId, WorkoutSplit updates) {
        WorkoutSplit split = getOwnedSplit(email, splitId);
        if (updates.getDay() != null) split.setDay(updates.getDay());
        if (updates.getSplitName() != null) split.setSplitName(updates.getSplitName());
        return workoutSplitRepository.saveAndFlush(split);
    }

    @Transactional
    public void deleteSplit(String email, UUID splitId) {
        WorkoutSplit split = getOwnedSplit(email, splitId);
        workoutSplitRepository.delete(split);
        workoutSplitRepository.flush();
    }

    @Transactional
    public Exercise addExercise(String email, UUID splitId, Exercise exercise) {
        WorkoutSplit split = getOwnedSplit(email, splitId);
        // Assign sortOrder = current count so new exercises go to the end
        int nextOrder = split.getExercises().size();
        exercise.setSortOrder(nextOrder);
        exercise.setWorkoutSplit(split);
        Exercise saved = exerciseRepository.save(exercise);
        split.getExercises().add(saved);
        workoutSplitRepository.saveAndFlush(split);
        return saved;
    }

    @Transactional
    public Exercise updateExercise(String email, UUID splitId, UUID exerciseId, Exercise updates) {
        getOwnedSplit(email, splitId); // Validation
        Exercise exercise = exerciseRepository.findById(exerciseId)
                .orElseThrow(() -> new RuntimeException("Exercise not found"));
        
        if (updates.getName() != null) exercise.setName(updates.getName());
        if (updates.getSets() > 0) exercise.setSets(updates.getSets());
        if (updates.getReps() > 0) exercise.setReps(updates.getReps());
        if (updates.getWeight() >= 0) exercise.setWeight(updates.getWeight());

        return exerciseRepository.saveAndFlush(exercise);
    }

    @Transactional
    public void deleteExercise(String email, UUID splitId, UUID exerciseId) {
        WorkoutSplit split = getOwnedSplit(email, splitId);
        split.getExercises().removeIf(e -> e.getId().equals(exerciseId));
        workoutSplitRepository.saveAndFlush(split);
    }

    @Transactional
    public void reorderExercises(String email, UUID splitId, List<UUID> orderedIds) {
        getOwnedSplit(email, splitId); // Validation
        List<Exercise> toSave = new ArrayList<>();
        for (int i = 0; i < orderedIds.size(); i++) {
            UUID exId = orderedIds.get(i);
            Exercise exercise = exerciseRepository.findById(exId)
                    .orElseThrow(() -> new RuntimeException("Exercise not found: " + exId));
            exercise.setSortOrder(i);
            toSave.add(exercise);
        }
        exerciseRepository.saveAllAndFlush(toSave);
    }

    private WorkoutSplit getOwnedSplit(String email, UUID splitId) {
        WorkoutSplit split = workoutSplitRepository.findById(splitId)
                .orElseThrow(() -> new RuntimeException("Workout Split not found"));
        if (!split.getUser().getEmail().equals(email)) {
            throw new RuntimeException("Unauthorized");
        }
        return split;
    }
}
