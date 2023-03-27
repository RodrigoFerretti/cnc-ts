import { Move } from "./move";
import { Sensor } from "./sensor";
import { Stepper } from "./stepper";

export class LinearMove extends Move {
    public constructor(options: LinearMove.Options) {
        super({ stepper: options.stepper, sensors: options.sensors, speed: options.speed });

        this.stepper.move({ position: options.position, speed: this.speed });
        this.nanoTimer.setInterval(this.loop, "", "1u");
    }

    protected loop = () => {
        if (this.getSensorsReadings()) {
            this.stepper.stop();
            this.status = Move.Status.SensorStopped;
            this.nanoTimer.clearInterval();
            return;
        }

        if (!this.stepper.isMoving()) {
            this.status = Move.Status.Completed;
            this.nanoTimer.clearInterval();
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
