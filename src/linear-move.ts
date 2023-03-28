import { Move } from "./move";
import { Sensor } from "./sensor";
import { Stepper } from "./stepper";

export class LinearMove extends Move {
    public constructor(options: LinearMove.Options) {
        super(options);

        this.stepper.on("destination", this.finish);
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
