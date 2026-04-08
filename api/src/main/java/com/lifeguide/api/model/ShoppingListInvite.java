package com.lifeguide.api.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "shopping_list_invites")
public class ShoppingListInvite {

    public enum Status {
        PENDING, ACCEPTED, DECLINED
    }

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "shopping_list_id", nullable = false)
    @JsonIgnore
    private ShoppingList shoppingList;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "sender_id", nullable = false)
    @JsonIgnore
    private User sender;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "recipient_id", nullable = false)
    @JsonIgnore
    private User recipient;

    @Enumerated(EnumType.STRING)
    private Status status = Status.PENDING;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public ShoppingListInvite() {}

    // Getters and Setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public ShoppingList getShoppingList() { return shoppingList; }
    public void setShoppingList(ShoppingList shoppingList) { this.shoppingList = shoppingList; }
    public User getSender() { return sender; }
    public void setSender(User sender) { this.sender = sender; }
    public User getRecipient() { return recipient; }
    public void setRecipient(User recipient) { this.recipient = recipient; }
    public Status getStatus() { return status; }
    public void setStatus(Status status) { this.status = status; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    // JSON helpers
    @JsonProperty("shoppingListId")
    public UUID getShoppingListId() {
        return shoppingList != null ? shoppingList.getId() : null;
    }

    @JsonProperty("shoppingListTitle")
    public String getShoppingListTitle() {
        return shoppingList != null ? shoppingList.getTitle() : null;
    }

    @JsonProperty("senderName")
    public String getSenderName() {
        if (sender == null) return null;
        return sender.getUsername() != null ? sender.getUsername() : sender.getName();
    }

    @JsonProperty("recipientName")
    public String getRecipientName() {
        if (recipient == null) return null;
        return recipient.getUsername() != null ? recipient.getUsername() : recipient.getName();
    }
}
