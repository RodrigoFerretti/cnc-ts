import { I2CBus } from "i2c-bus";
import { EventEmitter } from "stream";

export class I2C {
    private bus: I2CBus;
    private address: number;
    private command: number;
    private eventEmitter: EventEmitter;

    constructor(options: I2C.Options) {
        this.bus = options.bus;
        this.address = options.address;
        this.command = options.command;
        this.eventEmitter = new EventEmitter();

        setInterval(this.loop);
    }

    private loop = () => {
        const readings = this.bus.readWordSync(this.address, this.command).toString(2).split("").reverse();
        readings.reduce<void>((_, reading, index) => Number(reading) === 1 && this.emit(index), undefined);
    };

    private emit = (port: number) => {
        this.eventEmitter.emit(String(port));
    };

    public on = (port: number, listener: () => void) => {
        this.eventEmitter.on(String(port), listener);
    };
}

export namespace I2C {
    export type Options = {
        bus: I2CBus;
        address: number;
        command: number;
    };
}
