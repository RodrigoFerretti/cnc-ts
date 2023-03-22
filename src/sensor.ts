import { I2C } from "./i2c";

export class Sensor {
    private i2c: I2C;
    private port: number;

    constructor(options: Sensor.Options) {
        this.i2c = options.i2c;
        this.port = options.port;
    }

    public getReading = () => {
        return Boolean(Number(this.i2c.getReading().toString(2).charAt(this.port)));
    };
}

export namespace Sensor {
    export type Options = {
        i2c: I2C;
        port: number;
    };
}
