import { Move } from "./move";
import { Sensor } from "./sensor";
import { Stepper } from "./stepper";

export class Home extends Move {
    private stage: Home.Stage;
    private retractPosition: number;

    public constructor(options: Home.Options) {
        super({ stepper: options.stepper, sensors: options.sensors, speed: options.speed });

        this.stage = this.sensors[0].getReading() === true ? Home.Stage.ACompleted : Home.Stage.NotStarted;
        this.retractPosition = options.retractPosition;
    }

    public loop = () => {
        if (this.status === Move.Status.Completed) {
            return;
        }

        if (this.stage === Home.Stage.NotStarted) {
            this.stepper.linearMove({ position: -100_000, speed: 300000 });
            this.stage = Home.Stage.AInProcess;
        }

        if (this.stage === Home.Stage.AInProcess) {
            if (this.sensors[0].getReading() === false) return;

            this.stepper.stop();
            this.stepper.setPosition({ position: 0 });
            this.stage = Home.Stage.ACompleted;
        }

        if (this.stage === Home.Stage.ACompleted) {
            this.stepper.linearMove({ position: this.retractPosition, speed: this.speed });
            this.stage = Home.Stage.BInProcess;
        }

        if (this.stage === Home.Stage.BInProcess) {
            if (this.stepper.isMoving()) return;

            this.stage = Home.Stage.BCompleted;
        }

        if (this.stage === Home.Stage.BCompleted) {
            this.stepper.linearMove({ position: -(this.retractPosition * 2), speed: this.speed });
            this.stage = Home.Stage.CInProcess;
        }

        if (this.stage === Home.Stage.CInProcess) {
            if (this.sensors[0].getReading() === false) return;

            this.stepper.stop();
            this.stepper.setPosition({ position: 0 });
            this.stage = Home.Stage.CCompleted;
            this.status = Move.Status.Completed;
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
