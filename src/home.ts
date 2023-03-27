import { Move } from "./move";
import { Sensor } from "./sensor";
import { Stepper } from "./stepper";

export class Home extends Move {
    private stage: Home.Stage;
    private retractPosition: number;

    public constructor(options: Home.Options) {
        super({ stepper: options.stepper, sensors: options.sensors, speed: options.speed });

        this.stage = this.sensors[0].getReading() === true ? Home.Stage.ACompleted : Home.Stage.NotStarted;
        this.nanoTimer.setInterval(this.loop, "", "1u");
        this.retractPosition = options.retractPosition;
    }

    protected loop = () => {
        if (this.status === Move.Status.Completed) {
            return;
        }

        if (this.stage === Home.Stage.NotStarted) {
            this.stepper.move({ position: -Infinity, speed: this.stepper.getMaxSpeed() });
            this.stage = Home.Stage.AInProcess;
        }

        if (this.stage === Home.Stage.AInProcess) {
            if (this.sensors[0].getReading() === false) return;

            this.stepper.stop();
            this.stepper.setPosition({ position: 0 });
            this.stage = Home.Stage.ACompleted;
        }

        if (this.stage === Home.Stage.ACompleted) {
            this.stepper.move({ position: this.retractPosition, speed: this.speed });
            this.stage = Home.Stage.BInProcess;
        }

        if (this.stage === Home.Stage.BInProcess) {
            if (this.stepper.isMoving()) return;

            this.stage = Home.Stage.BCompleted;
        }

        if (this.stage === Home.Stage.BCompleted) {
            this.stepper.move({ position: -(this.retractPosition * 2), speed: this.speed });
            this.stage = Home.Stage.CInProcess;
        }

        if (this.stage === Home.Stage.CInProcess) {
            if (this.sensors[0].getReading() === false) return;

            this.stepper.stop();
            this.stepper.setPosition({ position: 0 });
            this.stage = Home.Stage.CCompleted;
            this.status = Move.Status.Completed;
            this.nanoTimer.clearInterval();
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
