import { Move } from "./move";
import { Sensor } from "./sensor";
import { Stepper } from "./stepper";

export class Home extends Move {
    private stage: Home.Stage;
    private retractPosition: number;

    public constructor(options: Home.Options) {
        super({ stepper: options.stepper, sensors: options.sensors, speed: options.speed });

        this.stage = Home.Stage.NotStarted;
        this.retractPosition = options.retractPosition;

        this.sensors[0].on("hit", this.onSensorHit);
        this.stepper.on("move-completed", this.onStepperMoveCompleted);

        this.nanoTimer.setInterval(this.loop, "", "1u");
    }

    private onSensorHit = () => {
        if (this.stage === Home.Stage.AInProcess) {
            this.stepper.stop();
            this.stepper.setPosition({ position: 0 });
            this.stage = Home.Stage.ACompleted;
        }

        if (this.stage === Home.Stage.CInProcess) {
            this.stepper.stop();
            this.stepper.setPosition({ position: 0 });
            this.stage = Home.Stage.CCompleted;
            this.status = Move.Status.Completed;
            this.nanoTimer.clearInterval();
        }
    };

    private onStepperMoveCompleted = () => {
        if (this.stage === Home.Stage.BInProcess) {
            this.stage = Home.Stage.BCompleted;
        }
    };

    private loop = () => {
        if (this.stage === Home.Stage.NotStarted) {
            this.stepper.move({ position: -Infinity, speed: 15000 });
            this.stage = Home.Stage.AInProcess;
        }

        if (this.stage === Home.Stage.ACompleted) {
            this.stepper.move({ position: this.retractPosition, speed: this.speed });
            this.stage = Home.Stage.BInProcess;
        }

        if (this.stage === Home.Stage.BCompleted) {
            this.stepper.move({ position: -Infinity, speed: this.speed });
            this.stage = Home.Stage.CInProcess;
        }
    };
}

export namespace Home {
    export type Options = {
        speed: number;
        stepper: Stepper;
        sensors: [Sensor, Sensor];
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
