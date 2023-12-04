import { Move } from "./move";
import { Stepper } from "../io/stepper";
import { Gpio } from "pigpio";

export class Home extends Move {
    private stage: Home.Stage;
    private retractSpeed: number;
    private retractPosition: number;

    public constructor(options: Home.Options) {
        super(options);

        this.stage = Home.Stage.NotStarted;
        this.homeSensor = options.homeSensor;
        this.limitSensor = options.limitSensor;
        this.retractSpeed = options.retractSpeed;
        this.retractPosition = options.retractPosition;

        this.stepper.on(Stepper.Event.MoveFinish, this.onStepperMoveFinish);
        this.homeSensor.forEach((sensor) => sensor.on("alert", (level) => !level && this.onHomeSensorTrigger()));
        this.limitSensor.forEach((sensor) => sensor.on("alert", (level) => !level && this.break()));
        this.nanoTimer.setInterval(this.loop, "", "1u");
    }

    private loop = () => {
        if (this.stage === Home.Stage.NotStarted) {
            return this.startStageA();
        }

        if (this.stage === Home.Stage.ACompleted) {
            return this.startStageB();
        }

        if (this.stage === Home.Stage.BCompleted) {
            return this.startStageC();
        }
    };

    private onStepperMoveFinish = () => {
        if (this.stage === Home.Stage.BInProcess) {
            return this.finishStageB();
        }
    };

    private onHomeSensorTrigger = () => {
        if (this.stage === Home.Stage.AInProcess) {
            return this.finishStageA();
        }

        if (this.stage === Home.Stage.CInProcess) {
            return this.finishStageC();
        }
    };

    private startStageA = () => {
        this.stepper.move({ position: -Infinity, speed: this.speed });
        this.stage = Home.Stage.AInProcess;
    };

    private finishStageA = () => {
        this.stepper.stop();
        this.stepper.position = 0;
        this.stage = Home.Stage.ACompleted;
    };

    private startStageB = () => {
        this.stepper.move({ position: this.retractPosition, speed: this.speed });
        this.stage = Home.Stage.BInProcess;
    };

    private finishStageB = () => {
        this.stage = Home.Stage.BCompleted;
    };

    private startStageC = () => {
        this.stepper.move({ position: -Infinity, speed: this.retractSpeed });
        this.stage = Home.Stage.CInProcess;
    };

    private finishStageC = () => {
        this.stepper.stop();
        this.stepper.position = 0;
        this.stage = Home.Stage.CCompleted;
        this.finish();
    };
}

export namespace Home {
    export type Options = {
        speed: number;
        stepper: Stepper;
        homeSensor: Gpio[];
        limitSensor: Gpio[];
        retractSpeed: number;
        retractPosition: number;
    };

    export enum Stage {
        NotStarted,
        AInProcess,
        ACompleted,
        BInProcess,
        BCompleted,
        CInProcess,
        CCompleted,
    }
}
