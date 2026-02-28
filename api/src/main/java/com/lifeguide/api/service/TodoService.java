package com.lifeguide.api.service;

import com.lifeguide.api.model.Todo;
import com.lifeguide.api.model.User;
import com.lifeguide.api.repository.TodoRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class TodoService {

    private final TodoRepository todoRepository;
    private final UserService userService;

    public TodoService(TodoRepository todoRepository, UserService userService) {
        this.todoRepository = todoRepository;
        this.userService = userService;
    }

    public List<Todo> getTodosForUser(String auth0Id) {
        return todoRepository.findByUserAuth0IdOrderByCreatedAtDesc(auth0Id);
    }

    public Todo createTodo(String auth0Id, Todo todoData) {
        User user = userService.getUserByAuth0Id(auth0Id);
        todoData.setUser(user);
        return todoRepository.save(todoData);
    }

    public Todo toggleTodo(String auth0Id, UUID todoId) {
        Todo todo = getOwnedTodo(auth0Id, todoId);
        todo.setCompleted(!todo.isCompleted());
        return todoRepository.save(todo);
    }

    public void deleteTodo(String auth0Id, UUID todoId) {
        Todo todo = getOwnedTodo(auth0Id, todoId);
        todoRepository.delete(todo);
    }

    private Todo getOwnedTodo(String auth0Id, UUID todoId) {
        Todo todo = todoRepository.findById(todoId)
                .orElseThrow(() -> new RuntimeException("Todo not found"));
        if (!todo.getUser().getAuth0Id().equals(auth0Id)) {
            throw new RuntimeException("Unauthorized");
        }
        return todo;
    }
}
