package com.lifeguide.api.controller;

import com.lifeguide.api.model.Todo;
import com.lifeguide.api.service.TodoService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
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
    public List<Todo> getTodos(@AuthenticationPrincipal Jwt jwt) {
        return todoService.getTodosForUser(jwt.getSubject());
    }

    @PostMapping
    public Todo createTodo(@AuthenticationPrincipal Jwt jwt, @RequestBody Todo todo) {
        return todoService.createTodo(jwt.getSubject(), todo);
    }

    @PutMapping("/{id}/toggle")
    public Todo toggleTodo(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID id) {
        return todoService.toggleTodo(jwt.getSubject(), id);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTodo(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID id) {
        todoService.deleteTodo(jwt.getSubject(), id);
        return ResponseEntity.ok().build();
    }
}
