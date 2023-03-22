import { EventEmitter } from "stream";

export class Broker {
    private eventEmitter: EventEmitter;

    constructor() {
        this.eventEmitter = new EventEmitter();
    }

    public on = (eventName: "message", listener: (message: string) => void) => {
        return this.eventEmitter.on(eventName, listener);
    };

    public emit = (eventName: "message", message: string) => {
        return this.eventEmitter.emit(eventName, message);
    };
}
