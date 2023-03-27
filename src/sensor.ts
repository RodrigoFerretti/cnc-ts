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

        this.i2C.on("reading", this.onI2CReading);
    }

    private onI2CReading = (reading: number) => {
        if (Boolean(Number(reading.toString(2).split("").reverse().join("").charAt(this.port)))) {
            this.emit("hit");
        }
    };

    private emit = (eventName: "hit") => {
        this.eventEmitter.emit(eventName);
    };

    public on = (eventName: "hit", listener: () => void) => {
        this.eventEmitter.on(eventName, listener);
    };
}

export namespace Sensor {
    export type Options = {
        i2C: I2C;
        port: number;
    };
}
