import { Sensor } from "../sensor";
import { Stepper } from "../stepper";
import { Move } from ".";

export class LinearMove extends Move {
    private speed: number;
    private maxSpeed: number;
    private position: number;

    public constructor(options: LinearMove.Options) {
        super({ stepper: options.stepper, sensors: options.sensors });

        this.maxSpeed = 200;
        this.position = options.position;

        this.speed = this.maxSpeed > options.speed! ? options.speed! : this.maxSpeed;

        this.stepper.linearMove({ position: this.position, speed: this.speed });
    }

    public loop = () => {
        if (this.getSensorsReading()) {
            this.status = Move.Status.SensorStopped;
            return;
        }

        if (this.status !== Move.Status.Moving) {
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
