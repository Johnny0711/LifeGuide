package com.lifeguide.api.repository;

import com.lifeguide.api.model.GymCard;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface GymCardRepository extends JpaRepository<GymCard, UUID> {
    Optional<GymCard> findByUser_Email(String email);
    void deleteByUser(com.lifeguide.api.model.User user);
}
