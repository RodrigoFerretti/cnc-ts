import NanoTimer from "nanotimer";
import { Sensor } from "../io/sensor";
import { Stepper } from "../io/stepper";

export abstract class Move {
    protected speed: number;
    protected stepper: Stepper;
    protected _status: Move.Status;
    protected nanoTimer: NanoTimer;
    protected homeSensor: Sensor;
    protected limitSensor: Sensor;

    public constructor(options: Move.Options) {
        this.speed = options.speed;
        this._status = Move.Status.Started;
        this.stepper = options.stepper;
        this.nanoTimer = new NanoTimer();
        this.homeSensor = options.homeSensor;
        this.limitSensor = options.limitSensor;
    }

    public get status() {
        return this._status;
    }

    protected finish = () => {
        this._status = Move.Status.Finished;
        this.nanoTimer.clearInterval();
    };

    public break = () => {
        this._status = Move.Status.Broke;
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
