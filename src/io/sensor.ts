import { Gpio } from "onoff";
import { EventEmitter } from "stream";

export class Sensor {
    private pin: Gpio;
    private eventEmitter: EventEmitter;

    constructor(options: Sensor.Options) {
        this.pin = options.pin;
        this.eventEmitter = new EventEmitter();

        setInterval(this.read);
    }

    private read = () => {
        const reading = this.pin.readSync();
        if (!reading) {
            this.emit(Sensor.Event.Trigger);
        }
    };

    private emit = <T extends Sensor.Event>(eventName: T) => {
        this.eventEmitter.emit(eventName);
    };

    public on = <T extends Sensor.Event>(eventName: T, listener: () => void) => {
        this.eventEmitter.on(eventName, listener);
    };
}

export namespace Sensor {
    export type Options = {
        pin: Gpio;
    };

    export enum Event {
        Trigger = "trigger",
    }
}
