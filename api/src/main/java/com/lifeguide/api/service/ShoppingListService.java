package com.lifeguide.api.service;

import com.lifeguide.api.model.*;
import com.lifeguide.api.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class ShoppingListService {

    private final ShoppingListRepository shoppingListRepository;
    private final ShoppingListItemRepository itemRepository;
    private final ShoppingListInviteRepository inviteRepository;
    private final UserRepository userRepository;
    private final UserService userService;

    public ShoppingListService(
            ShoppingListRepository shoppingListRepository,
            ShoppingListItemRepository itemRepository,
            ShoppingListInviteRepository inviteRepository,
            UserRepository userRepository,
            UserService userService) {
        this.shoppingListRepository = shoppingListRepository;
        this.itemRepository = itemRepository;
        this.inviteRepository = inviteRepository;
        this.userRepository = userRepository;
        this.userService = userService;
    }

    // --- Shopping Lists ---

    public List<ShoppingList> getListsForUser(String email) {
        List<ShoppingList> owned = shoppingListRepository.findByOwnerEmailOrderByCreatedAtDesc(email);
        List<ShoppingList> shared = shoppingListRepository.findSharedWithUser(email);
        List<ShoppingList> all = new ArrayList<>(owned);
        // Add shared lists that aren't already in owned
        for (ShoppingList sl : shared) {
            if (all.stream().noneMatch(o -> o.getId().equals(sl.getId()))) {
                all.add(sl);
            }
        }
        return all;
    }

    public ShoppingList createList(String email, ShoppingList listData) {
        User user = userService.getUserByEmail(email);
        listData.setOwner(user);
        return shoppingListRepository.save(listData);
    }

    public ShoppingList updateList(String email, UUID listId, ShoppingList updates) {
        ShoppingList list = getAccessibleList(email, listId);
        if (updates.getTitle() != null) list.setTitle(updates.getTitle());
        return shoppingListRepository.save(list);
    }

    public void deleteList(String email, UUID listId) {
        ShoppingList list = shoppingListRepository.findById(listId)
                .orElseThrow(() -> new RuntimeException("Shopping list not found"));
        if (!list.getOwner().getEmail().equals(email)) {
            throw new RuntimeException("Only the owner can delete this list");
        }
        shoppingListRepository.delete(list);
    }

    @Transactional
    public void leaveList(String email, UUID listId) {
        ShoppingList list = shoppingListRepository.findById(listId)
                .orElseThrow(() -> new RuntimeException("Shopping list not found"));
        
        if (list.getOwner().getEmail().equals(email)) {
            throw new RuntimeException("Owner cannot leave the list, they can only delete it.");
        }
        
        boolean removed = list.getSharedWith().removeIf(u -> u.getEmail().equals(email));
        if (!removed) {
            throw new RuntimeException("You are not part of this list.");
        }
        shoppingListRepository.save(list);
    }

    // --- Items ---

    @Transactional
    public ShoppingListItem addItem(String email, UUID listId, ShoppingListItem itemData) {
        ShoppingList list = getAccessibleList(email, listId);
        itemData.setShoppingList(list);
        itemData.setCompleted(false);
        return itemRepository.save(itemData);
    }

    @Transactional
    public ShoppingListItem toggleItem(String email, UUID listId, UUID itemId) {
        getAccessibleList(email, listId);
        ShoppingListItem item = itemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Item not found"));
        item.setCompleted(!item.isCompleted());
        return itemRepository.save(item);
    }

    @Transactional
    public void deleteItem(String email, UUID listId, UUID itemId) {
        getAccessibleList(email, listId);
        itemRepository.deleteById(itemId);
    }

    // --- Invites ---

    @Transactional
    public ShoppingListInvite inviteUser(String email, UUID listId, String recipientUsername) {
        ShoppingList list = shoppingListRepository.findById(listId)
                .orElseThrow(() -> new RuntimeException("Shopping list not found"));
        if (!list.getOwner().getEmail().equals(email)) {
            throw new RuntimeException("Only the owner can invite users");
        }
        User recipient = userRepository.findByUsername(recipientUsername)
                .orElseThrow(() -> new RuntimeException("User '" + recipientUsername + "' not found"));
        if (recipient.getEmail().equals(email)) {
            throw new RuntimeException("You can't invite yourself");
        }

        ShoppingListInvite invite = new ShoppingListInvite();
        invite.setShoppingList(list);
        invite.setSender(list.getOwner());
        invite.setRecipient(recipient);
        invite.setStatus(ShoppingListInvite.Status.PENDING);
        return inviteRepository.save(invite);
    }

    public List<ShoppingListInvite> getInvitesForUser(String email) {
        return inviteRepository.findByRecipientEmailOrderByCreatedAtDesc(email);
    }

    @Transactional
    public ShoppingListInvite acceptInvite(String email, UUID inviteId) {
        ShoppingListInvite invite = inviteRepository.findById(inviteId)
                .orElseThrow(() -> new RuntimeException("Invite not found"));
        if (!invite.getRecipient().getEmail().equals(email)) {
            throw new RuntimeException("This invite is not for you");
        }
        invite.setStatus(ShoppingListInvite.Status.ACCEPTED);

        // Add user to the shared list
        ShoppingList list = invite.getShoppingList();
        User recipient = invite.getRecipient();
        if (!list.getSharedWith().contains(recipient)) {
            list.getSharedWith().add(recipient);
            shoppingListRepository.save(list);
        }

        return inviteRepository.save(invite);
    }

    @Transactional
    public ShoppingListInvite declineInvite(String email, UUID inviteId) {
        ShoppingListInvite invite = inviteRepository.findById(inviteId)
                .orElseThrow(() -> new RuntimeException("Invite not found"));
        if (!invite.getRecipient().getEmail().equals(email)) {
            throw new RuntimeException("This invite is not for you");
        }
        invite.setStatus(ShoppingListInvite.Status.DECLINED);
        return inviteRepository.save(invite);
    }

    // --- Helper ---

    private ShoppingList getAccessibleList(String email, UUID listId) {
        ShoppingList list = shoppingListRepository.findById(listId)
                .orElseThrow(() -> new RuntimeException("Shopping list not found"));
        boolean isOwner = list.getOwner().getEmail().equals(email);
        boolean isShared = list.getSharedWith().stream()
                .anyMatch(u -> u.getEmail().equals(email));
        if (!isOwner && !isShared) {
            throw new RuntimeException("You don't have access to this list");
        }
        return list;
    }
}
