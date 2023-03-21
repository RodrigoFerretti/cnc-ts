import { Gpio } from "pigpio";
import { open } from "i2c-bus";

export class Sensor {
    private gpio: Gpio;
    private reading: boolean;

    constructor(options: Sensor.Options) {
        const pin = options.pin;

        this.gpio = new Gpio(pin, { mode: Gpio.INPUT });
        this.reading = true;
    }

    public read = () => {
        this.reading = Boolean(this.gpio.digitalRead());
    };

    public getReading = () => {
        return this.reading;
    };
}

export namespace Sensor {
    export type Options = {
        pin: number;
    };

    export const i2c = open(1, () => {});
}
