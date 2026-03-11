package com.lifeguide.api.repository;

import com.lifeguide.api.model.FitnessLog;
import com.lifeguide.api.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FitnessLogRepository extends JpaRepository<FitnessLog, Long> {
    List<FitnessLog> findByUserOrderByRecordedAtAsc(User user);
}
