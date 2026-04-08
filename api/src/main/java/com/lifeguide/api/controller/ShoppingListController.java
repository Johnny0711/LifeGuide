package com.lifeguide.api.controller;

import com.lifeguide.api.model.ShoppingList;
import com.lifeguide.api.model.ShoppingListInvite;
import com.lifeguide.api.model.ShoppingListItem;
import com.lifeguide.api.service.ShoppingListService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/shopping-lists")
public class ShoppingListController {

    private final ShoppingListService shoppingListService;

    public ShoppingListController(ShoppingListService shoppingListService) {
        this.shoppingListService = shoppingListService;
    }

    // --- Lists ---

    @GetMapping
    public List<ShoppingList> getLists(@AuthenticationPrincipal UserDetails userDetails) {
        return shoppingListService.getListsForUser(userDetails.getUsername());
    }

    @PostMapping
    public ShoppingList createList(@AuthenticationPrincipal UserDetails userDetails,
                                   @RequestBody ShoppingList list) {
        return shoppingListService.createList(userDetails.getUsername(), list);
    }

    @PutMapping("/{id}")
    public ShoppingList updateList(@AuthenticationPrincipal UserDetails userDetails,
                                   @PathVariable UUID id,
                                   @RequestBody ShoppingList updates) {
        return shoppingListService.updateList(userDetails.getUsername(), id, updates);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteList(@AuthenticationPrincipal UserDetails userDetails,
                                           @PathVariable UUID id) {
        shoppingListService.deleteList(userDetails.getUsername(), id);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}/leave")
    public ResponseEntity<Void> leaveList(@AuthenticationPrincipal UserDetails userDetails,
                                          @PathVariable UUID id) {
        shoppingListService.leaveList(userDetails.getUsername(), id);
        return ResponseEntity.ok().build();
    }

    // --- Items ---

    @PostMapping("/{listId}/items")
    public ShoppingListItem addItem(@AuthenticationPrincipal UserDetails userDetails,
                                    @PathVariable UUID listId,
                                    @RequestBody ShoppingListItem item) {
        return shoppingListService.addItem(userDetails.getUsername(), listId, item);
    }

    @PutMapping("/{listId}/items/{itemId}/toggle")
    public ShoppingListItem toggleItem(@AuthenticationPrincipal UserDetails userDetails,
                                       @PathVariable UUID listId,
                                       @PathVariable UUID itemId) {
        return shoppingListService.toggleItem(userDetails.getUsername(), listId, itemId);
    }

    @DeleteMapping("/{listId}/items/{itemId}")
    public ResponseEntity<Void> deleteItem(@AuthenticationPrincipal UserDetails userDetails,
                                           @PathVariable UUID listId,
                                           @PathVariable UUID itemId) {
        shoppingListService.deleteItem(userDetails.getUsername(), listId, itemId);
        return ResponseEntity.ok().build();
    }

    // --- Invites ---

    @PostMapping("/{listId}/invite")
    public ShoppingListInvite inviteUser(@AuthenticationPrincipal UserDetails userDetails,
                                         @PathVariable UUID listId,
                                         @RequestBody InviteRequest request) {
        return shoppingListService.inviteUser(userDetails.getUsername(), listId, request.getUsername());
    }

    @GetMapping("/invites")
    public List<ShoppingListInvite> getInvites(@AuthenticationPrincipal UserDetails userDetails) {
        return shoppingListService.getInvitesForUser(userDetails.getUsername());
    }

    @PostMapping("/invites/{inviteId}/accept")
    public ShoppingListInvite acceptInvite(@AuthenticationPrincipal UserDetails userDetails,
                                           @PathVariable UUID inviteId) {
        return shoppingListService.acceptInvite(userDetails.getUsername(), inviteId);
    }

    @PostMapping("/invites/{inviteId}/decline")
    public ShoppingListInvite declineInvite(@AuthenticationPrincipal UserDetails userDetails,
                                            @PathVariable UUID inviteId) {
        return shoppingListService.declineInvite(userDetails.getUsername(), inviteId);
    }

    // DTO
    public static class InviteRequest {
        private String username;
        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }
    }
}
