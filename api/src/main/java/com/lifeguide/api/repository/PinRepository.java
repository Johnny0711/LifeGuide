package com.lifeguide.api.repository;

import com.lifeguide.api.model.Pin;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface PinRepository extends JpaRepository<Pin, UUID> {
    List<Pin> findByUserEmailOrderByCreatedAtDesc(String auth0Id);
}
