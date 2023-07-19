import NanoTimer from "nanotimer";
import { Sensor } from "../io/sensor";
import { Stepper } from "../io/stepper";

export abstract class Move {
    protected speed: number;
    protected stepper: Stepper;
    protected nanoTimer: NanoTimer;
    protected homeSensor: Sensor;
    protected limitSensor: Sensor;
    protected currentStatus: Move.Status;

    public constructor(options: Move.Options) {
        this.speed = options.speed;
        this.currentStatus = Move.Status.Started;
        this.stepper = options.stepper;
        this.nanoTimer = new NanoTimer();
        this.homeSensor = options.homeSensor;
        this.limitSensor = options.limitSensor;
    }

    public get status() {
        return this.currentStatus;
    }

    protected finish = () => {
        this.currentStatus = Move.Status.Finished;
        this.nanoTimer.clearInterval();
    };

    public break = () => {
        this.currentStatus = Move.Status.Broke;
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
