import { v4 as uuidv4 } from 'uuid';

export interface IPin {
    id: string;
    title: string;
    content: string;
    color: string;
    createdAt: number;
}

export class PinItem implements IPin {
    id: string;
    title: string;
    content: string;
    color: string;
    createdAt: number;

    constructor(title: string, content: string, color: string, id?: string, createdAt = Date.now()) {
        this.id = id || uuidv4();
        this.title = title;
        this.content = content;
        this.color = color;
        this.createdAt = createdAt;
    }

    update(title: string, content: string, color: string): void {
        this.title = title;
        this.content = content;
        this.color = color;
    }

    static fromJSON(data: IPin): PinItem {
        return new PinItem(data.title, data.content, data.color, data.id, data.createdAt);
    }
}
