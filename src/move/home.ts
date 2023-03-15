import { Move } from ".";
import { Sensor } from "../sensor";
import { Stepper } from "../stepper";

export class Home extends Move {
    private step: Home.Step;
    private backMoveSpeed: number;
    private backMovePosition: number;

    public constructor(options: Home.Options) {
        super({ stepper: options.stepper, sensors: options.sensors });

        this.backMoveSpeed = 100;
        this.backMovePosition = 100;

        this.step = this.sensors[0].getReading() === true ? Home.Step.ACompleted : Home.Step.NotStarted;
    }

    public loop = () => {
        if (this.status === Move.Status.Completed) {
            return;
        }

        if (this.step === Home.Step.NotStarted) {
            this.stepper.linearMove({ position: -100_000 });
            this.step = Home.Step.AInProcess;
        }

        if (this.step === Home.Step.AInProcess) {
            if (this.sensors[0].getReading() === false) return;

            const currentPosition = this.stepper.getPosition();
            this.stepper.linearMove({ position: currentPosition });
            this.stepper.setPosition({ position: 0 });
            this.step = Home.Step.ACompleted;
        }

        if (this.step === Home.Step.ACompleted) {
            this.stepper.linearMove({ position: this.backMovePosition, speed: this.backMoveSpeed });
            this.step = Home.Step.BInProcess;
        }

        if (this.step === Home.Step.BInProcess) {
            if (this.stepper.distanceToGo() !== 0) return;

            this.step = Home.Step.BCompleted;
        }

        if (this.step === Home.Step.BCompleted) {
            this.stepper.linearMove({ position: -(this.backMovePosition * 2), speed: this.backMoveSpeed });
            this.step = Home.Step.CInProcess;
        }

        if (this.step === Home.Step.CInProcess) {
            if (this.sensors[0].getReading() === false) return;

            const currentPosition = this.stepper.getPosition();
            this.stepper.linearMove({ position: currentPosition });
            this.stepper.setPosition({ position: 0 });
            this.step = Home.Step.CCompleted;
            this.status = Move.Status.Completed;
        }
    };
}

export namespace Home {
    export type Options = {
        stepper: Stepper;
        sensors: [Sensor, Sensor];
    };

    export enum Step {
        NotStarted,
        AInProcess,
        ACompleted,
        BInProcess,
        BCompleted,
        CInProcess,
        CCompleted,
    }
}
