package com.lifeguide.api.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Entity
@Table(name = "shopping_lists")
public class ShoppingList {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    private String title;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "owner_id", nullable = false)
    @JsonIgnore
    private User owner;

    @OneToMany(mappedBy = "shoppingList", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    private Set<ShoppingListItem> items = new HashSet<>();

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
        name = "shopping_list_shares",
        joinColumns = @JoinColumn(name = "shopping_list_id"),
        inverseJoinColumns = @JoinColumn(name = "user_id")
    )
    @JsonIgnore
    private Set<User> sharedWith = new HashSet<>();

    @OneToMany(mappedBy = "shoppingList", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private Set<ShoppingListInvite> invites = new HashSet<>();

    public ShoppingList() {}

    // Getters and Setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public User getOwner() { return owner; }
    public void setOwner(User owner) { this.owner = owner; }
    public Set<ShoppingListItem> getItems() { return items; }
    public void setItems(Set<ShoppingListItem> items) { this.items = items; }
    public Set<User> getSharedWith() { return sharedWith; }
    public void setSharedWith(Set<User> sharedWith) { this.sharedWith = sharedWith; }

    @JsonProperty("ownerName")
    public String getOwnerName() {
        return owner != null ? owner.getName() : null;
    }

    @JsonProperty("ownerId")
    public UUID getOwnerId() {
        return owner != null ? owner.getId() : null;
    }

    @JsonProperty("sharedWithNames")
    public List<String> getSharedWithNames() {
        if (sharedWith == null) return new ArrayList<>();
        return sharedWith.stream()
                .map(u -> u.getUsername() != null ? u.getUsername() : u.getName())
                .toList();
    }
}
