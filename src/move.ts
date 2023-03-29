import NanoTimer from "nanotimer";
import { Sensor } from "./sensor";
import { Stepper } from "./stepper";

export abstract class Move {
    protected speed: number;
    protected status: Move.Status;
    protected stepper: Stepper;
    protected nanoTimer: NanoTimer;
    protected homeSensor: Sensor;
    protected limitSensor: Sensor;

    public constructor(options: Move.Options) {
        this.speed = options.speed;
        this.status = Move.Status.Started;
        this.stepper = options.stepper;
        this.nanoTimer = new NanoTimer();
        this.homeSensor = options.homeSensor;
        this.limitSensor = options.limitSensor;
    }

    public getStatus = () => {
        return this.status;
    };

    protected finish = () => {
        this.status = Move.Status.Finished;
        this.nanoTimer.clearInterval();
    };

    public break = () => {
        this.status = Move.Status.Broke;
        this.stepper.stop();
        this.nanoTimer.clearInterval();
    };
}

export namespace Move {
    export type Options = {
        speed: number;
        stepper: Stepper;
        homeSensor: Sensor;
        limitSensor: Sensor;
    };

    export enum Status {
        Broke = "broke",
        Started = "started",
        Finished = "finished",
    }
}
