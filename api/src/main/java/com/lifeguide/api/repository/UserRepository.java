package com.lifeguide.api.repository;

import com.lifeguide.api.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, java.util.UUID> {
    Optional<User> findByAuth0Id(String auth0Id);
}
