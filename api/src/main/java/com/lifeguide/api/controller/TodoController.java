package com.lifeguide.api.controller;

import com.lifeguide.api.model.Todo;
import com.lifeguide.api.service.TodoService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/todos")
public class TodoController {

    private final TodoService todoService;

    public TodoController(TodoService todoService) {
        this.todoService = todoService;
    }

    @GetMapping
    public List<Todo> getTodos(@AuthenticationPrincipal UserDetails userDetails) {
        return todoService.getTodosForUser(userDetails.getUsername());
    }

    @PostMapping
    public Todo createTodo(@AuthenticationPrincipal UserDetails userDetails, @RequestBody Todo todo) {
        return todoService.createTodo(userDetails.getUsername(), todo);
    }

    @PutMapping("/{id}/toggle")
    public Todo toggleTodo(@AuthenticationPrincipal UserDetails userDetails, @PathVariable UUID id) {
        return todoService.toggleTodo(userDetails.getUsername(), id);
    }

    @PutMapping("/{id}")
    public Todo updateTodo(@AuthenticationPrincipal UserDetails userDetails, @PathVariable UUID id, @RequestBody Todo todo) {
        return todoService.updateTodo(userDetails.getUsername(), id, todo);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTodo(@AuthenticationPrincipal UserDetails userDetails, @PathVariable UUID id) {
        todoService.deleteTodo(userDetails.getUsername(), id);
        return ResponseEntity.ok().build();
    }
}
