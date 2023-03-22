import { EventEmitter } from "stream";

export class Broker extends EventEmitter {
    constructor() {
        super();
    }

    public on = (eventName: "message", listener: (message: string) => void) => {
        return super.on(eventName, listener);
    };

    public emit = (eventName: "message", message: string) => {
        return super.emit(eventName, message);
    };
}
