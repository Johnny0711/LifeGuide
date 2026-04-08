package com.lifeguide.api.repository;

import com.lifeguide.api.model.WorkoutSplit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface WorkoutSplitRepository extends JpaRepository<WorkoutSplit, UUID> {
    List<WorkoutSplit> findByUserEmailOrderByCreatedAtAsc(String auth0Id);
}
