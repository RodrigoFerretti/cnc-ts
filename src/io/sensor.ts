import { Gpio } from "onoff";
import { EventEmitter } from "stream";
import { Debouncer } from "./debouncer";

export class Sensor {
    private pin: Gpio;
    private debouncer: Debouncer;
    private eventEmitter: EventEmitter;

    constructor(options: Sensor.Options) {
        this.pin = options.pin;
        this.debouncer = new Debouncer({ time: options.debounceTime });
        this.eventEmitter = new EventEmitter();

        setInterval(this.read);
    }

    private read = () => this.debouncer.debounce(this.pin.readSync()) && this.emit(Sensor.Event.Trigger);

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
        debounceTime: number;
    };

    export enum Event {
        Trigger = "trigger",
    }
}
