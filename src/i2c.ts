import { I2CBus } from "i2c-bus";

export class I2C {
    private bus: I2CBus;
    private reading: number;
    private address: number;
    private command: number;

    constructor(options: I2C.Options) {
        this.bus = options.bus;
        this.reading = 0;
        this.address = options.address;
        this.command = 0;
    }

    public read = () => {
        this.reading = this.bus.readWordSync(this.address, this.command);
    };

    public getReading = () => {
        return this.reading;
    };
}

export namespace I2C {
    export type Options = {
        address: number;
        bus: I2CBus;
    };
}
