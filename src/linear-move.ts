import { Move } from "./move";
import { Sensor } from "./sensor";
import { Stepper } from "./stepper";

export class LinearMove extends Move {
    public constructor(options: LinearMove.Options) {
        super(options);

        this.stepper.on("idle", this.finish);
        this.homeSensor.on("trigger", this.break);
        this.limitSensor.on("trigger", this.break);
        this.stepper.move({ position: options.position, speed: this.speed });
    }
}

export namespace LinearMove {
    export type Options = {
        speed: number;
        stepper: Stepper;
        position: number;
        homeSensor: Sensor;
        limitSensor: Sensor;
    };
}
