import { Gpio } from "pigpio";
import { EventEmitter } from "stream";

export class Sensor extends EventEmitter {
    private pin: Gpio;

    constructor(options: Sensor.Options) {
        super();

        this.pin = options.pin;

        setInterval(this.read);
    }

    private read = () => {
        const reading = this.pin.digitalRead();
        if (!reading) {
            this.emit(Sensor.Event.Trigger);
        }
    };

    public emit = <T extends Sensor.Event>(eventName: T) => {
        return super.emit(eventName);
    };

    public on = <T extends Sensor.Event>(eventName: T, listener: () => void) => {
        return super.on(eventName, listener);
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
