import { Sensor } from "./sensor";
import { Stepper } from "./stepper";

export class Looper {
    private sensors: [Sensor, Sensor, Sensor, Sensor, Sensor, Sensor];
    private steppers: [Stepper, Stepper, Stepper];

    constructor(options: Looper.Options) {
        this.sensors = options.sensors;
        this.steppers = options.steppers;

        this.sensors;
        this.steppers;
    }

    public loop = () => {
        for (const sensor of this.sensors) {
            sensor.read();
        }
    };
}

export namespace Looper {
    export enum Status {}

    export type Options = {
        steppers: [Stepper, Stepper, Stepper];
        sensors: [Sensor, Sensor, Sensor, Sensor, Sensor, Sensor];
    };
}
