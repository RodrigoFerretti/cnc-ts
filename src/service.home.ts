import { Sensor } from "./sensor";
import { Stepper } from "./stepper";

export class HomeService {
    private status: [HomeService.Status, HomeService.Status, HomeService.Status];
    private sensors: [Sensor, Sensor, Sensor, Sensor, Sensor, Sensor];
    private steppers: [Stepper, Stepper, Stepper];
    private backMoveSpeed: number;
    private backMovePosition: number;

    public constructor(options: HomeService.Options) {
        this.sensors = options.sensors;
        this.steppers = options.steppers;
        this.backMoveSpeed = 100;
        this.backMovePosition = 100;

        this.status = [
            this.sensors[0].reading === true ? HomeService.Status.StepACompleted : HomeService.Status.NotStarted,
            this.sensors[2].reading === true ? HomeService.Status.StepACompleted : HomeService.Status.NotStarted,
            this.sensors[4].reading === true ? HomeService.Status.StepACompleted : HomeService.Status.NotStarted,
        ];
    }

    public loop = () => {
        this.steppers.reduce<void>((_, stepper, i) => {
            if (this.status[i] === HomeService.Status.NotStarted) {
                stepper.linearMove({ position: -100_000 });
                this.status[i] = HomeService.Status.StepAInProcess;
            }

            if (this.status[i] === HomeService.Status.StepAInProcess) {
                if (this.sensors[i * 2].reading === false) return;

                const currentPosition = stepper.getPosition();
                stepper.linearMove({ position: currentPosition });
                stepper.setPosition({ position: 0 });
                this.status[i] = HomeService.Status.StepACompleted;
            }

            if (this.status[i] === HomeService.Status.StepACompleted) {
                stepper.linearMove({ position: this.backMovePosition, speed: this.backMoveSpeed });
                this.status[i] = HomeService.Status.StepBInProcess;
            }

            if (this.status[i] === HomeService.Status.StepBInProcess) {
                if (stepper.distanceToGo() !== 0) return;

                this.status[i] = HomeService.Status.StepBCompleted;
            }

            if (this.status[i] === HomeService.Status.StepBCompleted) {
                stepper.linearMove({ position: -(this.backMovePosition * 2), speed: this.backMoveSpeed });
                this.status[i] = HomeService.Status.StepCInProcess;
            }

            if (this.status[i] === HomeService.Status.StepCInProcess) {
                if (this.sensors[i * 2].reading === false) return;

                const currentPosition = stepper.getPosition();
                stepper.linearMove({ position: currentPosition });
                stepper.setPosition({ position: 0 });
                this.status[i] = HomeService.Status.Completed;
            }
        }, undefined);
    };
}

export namespace HomeService {
    export type Options = {
        steppers: [Stepper, Stepper, Stepper];
        sensors: [Sensor, Sensor, Sensor, Sensor, Sensor, Sensor];
    };

    export enum Status {
        NotStarted = "not-started",
        StepAInProcess = "step-a-in-process",
        StepACompleted = "step-a-completed",
        StepBInProcess = "step-b-in-process",
        StepBCompleted = "step-b-completed",
        StepCInProcess = "step-c-in-process",
        Completed = "completed",
    }
}
