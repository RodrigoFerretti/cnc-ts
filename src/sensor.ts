import { EventEmitter } from "stream";
import { I2C } from "./i2c";

export class Sensor {
    private i2C: I2C;
    private port: number;
    private eventEmitter: EventEmitter;

    constructor(options: Sensor.Options) {
        this.i2C = options.i2C;
        this.port = options.port;
        this.eventEmitter = new EventEmitter();

        this.i2C.on(this.port, () => this.emit("trigger"));
    }

    private emit = (eventName: "trigger") => {
        this.eventEmitter.emit(eventName);
    };

    public on = (eventName: "trigger", listener: () => void) => {
        this.eventEmitter.on(eventName, listener);
    };
}

export namespace Sensor {
    export type Options = {
        i2C: I2C;
        port: number;
    };
}
