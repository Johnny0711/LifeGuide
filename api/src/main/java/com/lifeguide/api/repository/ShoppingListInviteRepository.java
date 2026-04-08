package com.lifeguide.api.repository;

import com.lifeguide.api.model.ShoppingListInvite;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ShoppingListInviteRepository extends JpaRepository<ShoppingListInvite, UUID> {

    List<ShoppingListInvite> findByRecipientEmailAndStatusOrderByCreatedAtDesc(
            String email, ShoppingListInvite.Status status);

    List<ShoppingListInvite> findByRecipientEmailOrderByCreatedAtDesc(String email);
}
