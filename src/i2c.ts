import { I2CBus, open } from "i2c-bus";

export class I2C {
    private bus: I2CBus;
    private reading: number;
    private address: number;
    private command: number;

    constructor(options: I2C.Options) {
        const busNumer = options.busNumber;

        this.bus = open(busNumer, () => {});
        this.reading = 0;
        this.address = options.address;
        this.command = 0;

        setInterval(this.read);
    }

    private read = () => {
        this.reading = this.bus.readWordSync(this.address, this.command);
    };

    public getReading = () => {
        return this.reading;
    };
}

export namespace I2C {
    export type Options = {
        address: number;
        busNumber: number;
    };
}
