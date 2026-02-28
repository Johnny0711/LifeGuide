import { v4 as uuidv4 } from 'uuid';

export interface IHabit {
    id: string;
    name: string;
    history: string[]; // array of short iso strings YYYY-MM-DD
    createdAt: number;
}

export class HabitItem implements IHabit {
    id: string;
    name: string;
    history: string[];
    createdAt: number;

    constructor(name: string, history: string[] = [], id?: string, createdAt = Date.now()) {
        this.name = name;
        this.history = history;
        this.id = id || uuidv4();
        this.createdAt = createdAt;
    }

    toggleDay(dateStr: string): void {
        const idx = this.history.indexOf(dateStr);
        if (idx > -1) {
            this.history.splice(idx, 1);
        } else {
            this.history.push(dateStr);
        }
    }

    isCompleted(dateStr: string): boolean {
        return this.history.includes(dateStr);
    }

    getStreakStr(): number {
        // Basic streak calculation going backwards from today
        let streak = 0;
        let curr = new Date();

        // Convert to target generic day string 
        const toDateStr = (d: Date) => d.toISOString().split('T')[0];

        // Check today first
        if (this.isCompleted(toDateStr(curr))) streak++;

        // Go backwards starting from yesterday
        curr.setDate(curr.getDate() - 1);
        while (this.isCompleted(toDateStr(curr))) {
            streak++;
            curr.setDate(curr.getDate() - 1);
        }

        return streak;
    }

    static fromJSON(data: IHabit): HabitItem {
        return new HabitItem(data.name, data.history, data.id, data.createdAt);
    }
}
