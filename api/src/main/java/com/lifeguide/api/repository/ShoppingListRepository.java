package com.lifeguide.api.repository;

import com.lifeguide.api.model.ShoppingList;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ShoppingListRepository extends JpaRepository<ShoppingList, UUID> {

    List<ShoppingList> findByOwnerEmailOrderByCreatedAtDesc(String email);

    @Query("SELECT sl FROM ShoppingList sl JOIN sl.sharedWith sw WHERE sw.email = :email ORDER BY sl.createdAt DESC")
    List<ShoppingList> findSharedWithUser(@Param("email") String email);
}
