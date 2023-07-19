import { EventEmitter } from "stream";

export class Broker {
    private eventEmitter: EventEmitter;

    constructor() {
        this.eventEmitter = new EventEmitter();
    }

    public on = <T extends Broker.Event>(eventName: T, listener: (message: string) => void) => {
        this.eventEmitter.on(eventName, listener);
    };

    public emit = <T extends Broker.Event>(eventName: T, message: string) => {
        this.eventEmitter.emit(eventName, message);
    };
}

export namespace Broker {
    export enum Event {
        Message = "message",
    }
}
