import NanoTimer from "nanotimer";
import { Sensor } from "./sensor";
import { Stepper } from "./stepper";

export abstract class Move {
    protected speed: number;
    protected status: Move.Status;
    protected stepper: Stepper;
    protected sensors: [Sensor, Sensor];
    protected nanoTimer: NanoTimer;

    public constructor(options: Move.Options) {
        this.speed = options.speed;
        this.status = Move.Status.Moving;
        this.stepper = options.stepper;
        this.sensors = options.sensors;
        this.nanoTimer = new NanoTimer();
    }

    public getStatus = () => {
        return this.status;
    };
}

export namespace Move {
    export type Options = {
        speed: number;
        stepper: Stepper;
        sensors: [Sensor, Sensor];
    };

    export enum Status {
        Moving = "moving",
        Completed = "completed",
        SensorStopped = "sensor-stopped",
    }
}
