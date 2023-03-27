import { Move } from "./move";
import { Sensor } from "./sensor";
import { Stepper } from "./stepper";

export class LinearMove extends Move {
    public constructor(options: LinearMove.Options) {
        super({ stepper: options.stepper, sensors: options.sensors, speed: options.speed });

        this.sensors[0].on("hit", this.onSensorHit);
        this.sensors[1].on("hit", this.onSensorHit);
        this.stepper.on("move-completed", this.onStepperMoveCompleted);

        this.stepper.move({ position: options.position, speed: this.speed });
    }

    private onSensorHit = () => {
        this.status = Move.Status.SensorStopped;
        this.stepper.stop();
        this.nanoTimer.clearInterval();
    };

    private onStepperMoveCompleted = () => {
        this.status = Move.Status.Completed;
        this.nanoTimer.clearInterval();
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
