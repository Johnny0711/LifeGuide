package com.lifeguide.api.repository;

import com.lifeguide.api.model.Todo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface TodoRepository extends JpaRepository<Todo, UUID> {
    List<Todo> findByUserEmailOrderByCreatedAtDesc(String auth0Id);
}
