package com.lifeguide.api.model;

import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "exercises")
public class Exercise {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    private String name;
    private int sets;
    private int reps;
    private double weight;

    @Column(name = "sort_order", columnDefinition = "INTEGER DEFAULT 0")
    private Integer sortOrder = 0;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "workout_split_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private WorkoutSplit workoutSplit;

    public Exercise() {}

    // Getters and Setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public int getSets() { return sets; }
    public void setSets(int sets) { this.sets = sets; }
    public int getReps() { return reps; }
    public void setReps(int reps) { this.reps = reps; }
    public double getWeight() { return weight; }
    public void setWeight(double weight) { this.weight = weight; }
    public Integer getSortOrder() { return sortOrder != null ? sortOrder : 0; }
    public void setSortOrder(Integer sortOrder) { this.sortOrder = sortOrder != null ? sortOrder : 0; }
    @com.fasterxml.jackson.annotation.JsonIgnore
    public WorkoutSplit getWorkoutSplit() { return workoutSplit; }
    @com.fasterxml.jackson.annotation.JsonIgnore
    public void setWorkoutSplit(WorkoutSplit workoutSplit) { this.workoutSplit = workoutSplit; }
}
