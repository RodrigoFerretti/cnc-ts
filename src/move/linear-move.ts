import { Move } from "./move";
import { Stepper } from "../io/stepper";
import { Gpio } from "pigpio";

export class LinearMove extends Move {
    public constructor(options: LinearMove.Options) {
        super(options);

        this.stepper.on(Stepper.Event.MoveFinish, this.finish);
        this.homeSensor.forEach((sensor) => sensor.on("alert", (level) => !level && this.break()));
        this.limitSensor.forEach((sensor) => sensor.on("alert", (level) => !level && this.break()));
        this.stepper.move({ position: options.position, speed: this.speed });
    }
}

export namespace LinearMove {
    export type Options = {
        speed: number;
        stepper: Stepper;
        position: number;
        homeSensor: Gpio[];
        limitSensor: Gpio[];
    };
}
