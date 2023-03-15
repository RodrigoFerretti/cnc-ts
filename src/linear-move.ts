import { Sensor } from "./sensor";
import { Stepper } from "./stepper";
import { Move } from "./move";

export class LinearMove extends Move {
    private position: number;

    public constructor(options: LinearMove.Options) {
        const maxSpeed = 200;
        const speed = maxSpeed > options.speed! ? options.speed! : maxSpeed;

        super({ stepper: options.stepper, sensors: options.sensors, speed });

        this.position = options.position;

        this.stepper.linearMove({ position: this.position, speed: this.speed });
    }

    public loop = () => {
        if (this.getSensorsReadings()) {
            this.stepper.linearMove({ position: this.stepper.getPosition() });
            this.status = Move.Status.SensorStopped;
            return;
        }

        if (this.status !== Move.Status.Moving) {
            return;
        }

        if (this.stepper.distanceToGo() === 0) {
            this.status = Move.Status.Completed;
            return;
        }
    };
}

export namespace LinearMove {
    export type Options = {
        speed?: number;
        stepper: Stepper;
        sensors: [Sensor, Sensor];
        position: number;
    };
}
