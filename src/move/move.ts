import NanoTimer from "nanotimer";
import { Gpio } from "pigpio";
import { Stepper } from "../io/stepper";

export abstract class Move {
    protected speed: number;
    protected stepper: Stepper;
    protected currentStatus: Move.Status;
    protected nanoTimer: NanoTimer;
    protected homeSensor: Gpio[];
    protected limitSensor: Gpio[];

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

    protected clean = () => {
        this.nanoTimer.clearInterval();
        this.stepper.removeAllListeners();
        this.homeSensor.forEach((sensor) => sensor.removeAllListeners());
        this.limitSensor.forEach((sensor) => sensor.removeAllListeners());
    };

    protected finish = () => {
        this.currentStatus = Move.Status.Finished;
        this.clean();
    };

    public break = () => {
        this.currentStatus = Move.Status.Broke;
        this.stepper.stop();
        this.clean();
    };
}

export namespace Move {
    export type Options = {
        speed: number;
        stepper: Stepper;
        homeSensor: Gpio[];
        limitSensor: Gpio[];
    };

    export enum Status {
        Broke = "broke",
        Started = "started",
        Finished = "finished",
    }
}
