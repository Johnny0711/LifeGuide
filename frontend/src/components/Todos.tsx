import React, { useState, useEffect } from 'react';
import api from '../services/apiService';
import { Check, Trash2, Plus, Edit2 } from 'lucide-react';
import { type ITodo } from '../models/TodoItem';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { Input } from './ui/Input';
import { ConfirmModal } from './ui/ConfirmModal';
import './Todos.css';

const Todos: React.FC = () => {
    const [todos, setTodos] = useState<ITodo[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [inputValue, setInputValue] = useState('');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editValue, setEditValue] = useState('');
    
    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [todoToDelete, setTodoToDelete] = useState<string | null>(null);

    useEffect(() => {
        fetchTodos();
    }, []);

    const fetchTodos = async () => {
        try {
            const response = await api.get('/todos');
            if (Array.isArray(response.data)) {
                setTodos(response.data);
            } else {
                setTodos([]);
            }
        } catch (error) {
            console.error('Failed to fetch todos', error);
        } finally {
            setIsLoading(false);
        }
    };

    const addTodo = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputValue.trim()) return;

        try {
            const response = await api.post('/todos', { text: inputValue.trim(), completed: false });
            setTodos(prev => [response.data, ...prev]);
            setInputValue('');
        } catch (error) {
            console.error('Failed to create todo', error);
        }
    };

    const toggleTodo = async (id: string) => {
        try {
            const response = await api.put(`/todos/${id}/toggle`);
            setTodos(prev => prev.map(t => (t.id === id ? response.data : t)));
        } catch (error) {
            console.error('Failed to toggle todo', error);
        }
    };

    const saveEdit = async (id: string) => {
        if (!editValue.trim()) {
            setEditingId(null);
            return;
        }
        try {
            const response = await api.put(`/todos/${id}`, { text: editValue.trim() });
            setTodos(prev => prev.map(t => (t.id === id ? response.data : t)));
        } catch (error) {
            console.error('Failed to update todo', error);
        } finally {
            setEditingId(null);
        }
    };

    const startEditing = (todo: ITodo) => {
        setEditingId(todo.id);
        setEditValue(todo.text);
    };

    const requestDelete = (id: string) => {
        setTodoToDelete(id);
        setIsModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!todoToDelete) return;
        try {
            await api.delete(`/todos/${todoToDelete}`);
            setTodos(prev => prev.filter(t => t.id !== todoToDelete));
        } catch (error) {
            console.error('Failed to delete todo', error);
        } finally {
            setIsModalOpen(false);
            setTodoToDelete(null);
        }
    };

    return (
        <div className="todos-container animate-fade-in">
            <header className="todos-header">
                <h1>To-Do List</h1>
                <p>Keep track of your daily tasks.</p>
            </header>

            <Card className="todos-content" noPadding={false}>
                <form onSubmit={addTodo} className="add-todo-form">
                    <Input
                        fullWidth
                        type="text"
                        placeholder="What needs to be done?"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                    />
                    <Button
                        type="submit"
                        variant="primary"
                        disabled={!inputValue.trim()}
                        leftIcon={<Plus size={20} />}
                    >
                        Add
                    </Button>
                </form>

                <ul className="todo-list">
                    {isLoading ? (
                        <div className="empty-state">Loading Tasks...</div>
                    ) : todos.length === 0 ? (
                        <div className="empty-state">No tasks yet. Enjoy your day!</div>
                    ) : (
                        [...todos]
                            .sort((a, b) => Number(a.completed) - Number(b.completed))
                            .map((todo) => (
                                <li key={todo.id} className={`todo-item ${todo.completed ? 'completed' : ''}`}>
                                    <button
                                        type="button"
                                        className="todo-checkbox"
                                        onClick={() => toggleTodo(todo.id)}
                                        aria-label="Toggle completion"
                                    >
                                        {todo.completed && <Check size={16} className="check-icon" />}
                                    </button>

                                    {editingId === todo.id ? (
                                        <Input
                                            value={editValue}
                                            onChange={(e) => setEditValue(e.target.value)}
                                            onBlur={() => saveEdit(todo.id)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') saveEdit(todo.id);
                                                if (e.key === 'Escape') setEditingId(null);
                                            }}
                                            autoFocus
                                            className="todo-edit-input"
                                        />
                                    ) : (
                                        <span className="todo-text">{todo.text}</span>
                                    )}

                                    {editingId !== todo.id && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="todo-edit-btn"
                                            onClick={() => startEditing(todo)}
                                            aria-label="Edit task"
                                        >
                                            <Edit2 size={16} />
                                        </Button>
                                    )}

                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="todo-delete-btn"
                                        onClick={() => requestDelete(todo.id)}
                                        aria-label="Delete task"
                                    >
                                        <Trash2 size={18} />
                                    </Button>
                                </li>
                            ))
                    )}
                </ul>
            </Card>

            <ConfirmModal
                isOpen={isModalOpen}
                title="Delete Task?"
                message="This action cannot be undone. This task will be permanently removed."
                onConfirm={confirmDelete}
                onCancel={() => setIsModalOpen(false)}
            />
        </div>
    );
};

export default Todos;
