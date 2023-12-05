import { Gpio } from "pigpio";
import { EventEmitter } from "stream";

export class Sensor extends EventEmitter {
    constructor(private pin: Gpio) {
        super();
        setInterval(this.read);
    }

    private read = () => {
        const reading = this.pin.digitalRead();
        if (!reading) {
            this.emit(Sensor.Event.Read);
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
    export enum Event {
        Read = "read",
    }
}
