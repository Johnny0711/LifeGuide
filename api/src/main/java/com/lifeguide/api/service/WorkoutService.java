package com.lifeguide.api.service;

import com.lifeguide.api.model.Exercise;
import com.lifeguide.api.model.User;
import com.lifeguide.api.model.WorkoutSplit;
import com.lifeguide.api.repository.ExerciseRepository;
import com.lifeguide.api.repository.WorkoutSplitRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class WorkoutService {

    private final WorkoutSplitRepository workoutSplitRepository;
    private final ExerciseRepository exerciseRepository;
    private final UserService userService;

    public WorkoutService(WorkoutSplitRepository workoutSplitRepository, ExerciseRepository exerciseRepository, UserService userService) {
        this.workoutSplitRepository = workoutSplitRepository;
        this.exerciseRepository = exerciseRepository;
        this.userService = userService;
    }

    public List<WorkoutSplit> getWorkoutsForUser(String auth0Id) {
        return workoutSplitRepository.findByUserAuth0IdOrderByCreatedAtAsc(auth0Id);
    }

    public WorkoutSplit createSplit(String auth0Id, WorkoutSplit splitData) {
        User user = userService.getUserByAuth0Id(auth0Id);
        splitData.setUser(user);
        if (splitData.getExercises() != null) {
            splitData.getExercises().forEach(e -> e.setWorkoutSplit(splitData));
        }
        return workoutSplitRepository.save(splitData);
    }

    public WorkoutSplit updateSplit(String auth0Id, UUID splitId, WorkoutSplit updates) {
        WorkoutSplit split = getOwnedSplit(auth0Id, splitId);
        if (updates.getDay() != null) split.setDay(updates.getDay());
        if (updates.getSplitName() != null) split.setSplitName(updates.getSplitName());
        return workoutSplitRepository.save(split);
    }

    public void deleteSplit(String auth0Id, UUID splitId) {
        WorkoutSplit split = getOwnedSplit(auth0Id, splitId);
        workoutSplitRepository.delete(split);
    }

    public Exercise addExercise(String auth0Id, UUID splitId, Exercise exercise) {
        WorkoutSplit split = getOwnedSplit(auth0Id, splitId);
        exercise.setWorkoutSplit(split);
        return exerciseRepository.save(exercise);
    }

    public Exercise updateExercise(String auth0Id, UUID splitId, UUID exerciseId, Exercise updates) {
        getOwnedSplit(auth0Id, splitId); // Validation
        Exercise exercise = exerciseRepository.findById(exerciseId)
                .orElseThrow(() -> new RuntimeException("Exercise not found"));
        
        if (updates.getName() != null) exercise.setName(updates.getName());
        if (updates.getSets() > 0) exercise.setSets(updates.getSets());
        if (updates.getReps() > 0) exercise.setReps(updates.getReps());
        if (updates.getWeight() >= 0) exercise.setWeight(updates.getWeight());

        return exerciseRepository.save(exercise);
    }

    public void deleteExercise(String auth0Id, UUID splitId, UUID exerciseId) {
        getOwnedSplit(auth0Id, splitId); // Validation
        exerciseRepository.deleteById(exerciseId);
    }

    private WorkoutSplit getOwnedSplit(String auth0Id, UUID splitId) {
        WorkoutSplit split = workoutSplitRepository.findById(splitId)
                .orElseThrow(() -> new RuntimeException("Workout Split not found"));
        if (!split.getUser().getAuth0Id().equals(auth0Id)) {
            throw new RuntimeException("Unauthorized");
        }
        return split;
    }
}
