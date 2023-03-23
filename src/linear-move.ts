import { Move } from "./move";
import { Sensor } from "./sensor";
import { Stepper } from "./stepper";

export class LinearMove extends Move {
    public constructor(options: LinearMove.Options) {
        super({ stepper: options.stepper, sensors: options.sensors, speed: options.speed });

        this.stepper.linearMove({ position: options.position, speed: this.speed });
    }

    public loop = () => {
        if (this.getSensorsReadings()) {
            this.stepper.stop();
            this.status = Move.Status.SensorStopped;
            return;
        }

        if (this.status !== Move.Status.Moving) {
            return;
        }

        if (!this.stepper.isMoving()) {
            this.status = Move.Status.Completed;
            return;
        }
    };
}

export namespace LinearMove {
    export type Options = {
        speed: number;
        stepper: Stepper;
        sensors: [Sensor, Sensor];
        position: number;
    };
}
