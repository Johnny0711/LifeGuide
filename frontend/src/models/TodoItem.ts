import { v4 as uuidv4 } from 'uuid';

export interface ITodo {
    id: string;
    text: string;
    completed: boolean;
    createdAt: number;
}

export class TodoItem implements ITodo {
    id: string;
    text: string;
    completed: boolean;
    createdAt: number;

    constructor(text: string, id?: string, completed = false, createdAt = Date.now()) {
        this.text = text;
        this.id = id || uuidv4();
        this.completed = completed;
        this.createdAt = createdAt;
    }

    toggle(): void {
        this.completed = !this.completed;
    }

    updateText(newText: string): void {
        this.text = newText;
    }

    // Helper to rehydrate from JSON
    static fromJSON(data: ITodo): TodoItem {
        return new TodoItem(data.text, data.id, data.completed, data.createdAt);
    }
}
