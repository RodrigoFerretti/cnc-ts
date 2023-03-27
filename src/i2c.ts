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
        this.command = 0;
        this.eventEmitter = new EventEmitter();

        setInterval(this.loop);
    }

    private loop = () => {
        this.emit("reading", this.bus.readWordSync(this.address, this.command));
    };

    private emit = (eventName: "reading", reading: number) => {
        this.eventEmitter.emit(eventName, reading);
    };

    public on = (eventName: "reading", listener: (reading: number) => void) => {
        this.eventEmitter.on(eventName, listener);
    };
}

export namespace I2C {
    export type Options = {
        address: number;
        bus: I2CBus;
    };
}
