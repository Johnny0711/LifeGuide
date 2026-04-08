package com.lifeguide.api.service;

import com.lifeguide.api.model.Todo;
import com.lifeguide.api.model.User;
import com.lifeguide.api.repository.TodoRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class TodoService {

    private final TodoRepository todoRepository;
    private final UserService userService;

    public TodoService(TodoRepository todoRepository, UserService userService) {
        this.todoRepository = todoRepository;
        this.userService = userService;
    }

    public List<Todo> getTodosForUser(String email) {
        return todoRepository.findByUserEmailOrderByCreatedAtDesc(email);
    }

    public Todo createTodo(String email, Todo todoData) {
        User user = userService.getUserByEmail(email);
        todoData.setUser(user);
        return todoRepository.save(todoData);
    }

    public Todo toggleTodo(String email, UUID todoId) {
        Todo todo = getOwnedTodo(email, todoId);
        todo.setCompleted(!todo.isCompleted());
        return todoRepository.save(todo);
    }

    public Todo updateTodo(String email, UUID todoId, Todo updates) {
        Todo todo = getOwnedTodo(email, todoId);
        if (updates.getText() != null) {
            todo.setText(updates.getText());
        }
        return todoRepository.save(todo);
    }

    public void deleteTodo(String email, UUID todoId) {
        Todo todo = getOwnedTodo(email, todoId);
        todoRepository.delete(todo);
    }

    private Todo getOwnedTodo(String email, UUID todoId) {
        Todo todo = todoRepository.findById(todoId)
                .orElseThrow(() -> new RuntimeException("Todo not found"));
        if (!todo.getUser().getEmail().equals(email)) {
            throw new RuntimeException("Unauthorized");
        }
        return todo;
    }
}
