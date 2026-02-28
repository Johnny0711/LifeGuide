import { v4 as uuidv4 } from 'uuid';

export interface IExercise {
    id: string;
    name: string;
    sets: number;
    reps: number;
    weight: number;
}

export interface IDaySplit {
    id?: string;
    day: string;
    splitName: string;
    exercises: IExercise[];
}

export class Exercise implements IExercise {
    id: string;
    name: string;
    sets: number;
    reps: number;
    weight: number;

    constructor(name: string, sets = 3, reps = 10, weight = 0, id?: string) {
        this.id = id || uuidv4();
        this.name = name;
        this.sets = sets;
        this.reps = reps;
        this.weight = weight;
    }

    update(updates: Partial<IExercise>): void {
        Object.assign(this, updates);
    }

    static fromJSON(data: IExercise): Exercise {
        return new Exercise(data.name, data.sets, data.reps, data.weight, data.id);
    }
}

export class DaySplit implements IDaySplit {
    id: string;
    day: string;
    splitName: string;
    exercises: Exercise[];

    constructor(day: string, splitName: string = '', exercises: Exercise[] = [], id?: string) {
        this.id = id || uuidv4();
        this.day = day;
        this.splitName = splitName;
        this.exercises = exercises;
    }

    addExercise(): Exercise {
        const ex = new Exercise('New Exercise');
        this.exercises.push(ex);
        return ex;
    }

    removeExercise(id: string): void {
        this.exercises = this.exercises.filter(ex => ex.id !== id);
    }

    updateSplitName(name: string): void {
        this.splitName = name;
    }

    static fromJSON(data: IDaySplit): DaySplit {
        const split = new DaySplit(data.day, data.splitName, [], data.id);
        split.exercises = data.exercises.map(ex => Exercise.fromJSON(ex));
        return split;
    }

    static generateDefaultWeek(): DaySplit[] {
        return [
            new DaySplit('Monday', 'Push'),
            new DaySplit('Tuesday', 'Pull'),
            new DaySplit('Wednesday', 'Legs'),
            new DaySplit('Thursday', 'Rest'),
            new DaySplit('Friday', 'Upper'),
            new DaySplit('Saturday', 'Lower'),
            new DaySplit('Sunday', 'Rest'),
        ];
    }
}
