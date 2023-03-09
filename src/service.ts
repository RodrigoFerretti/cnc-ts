import { Stepper } from "./stepper";
import { Switch } from "./switch";
import { Vector } from "./vector";

export class Service {
    private status: Service.Status;

    constructor(
        private steppers: [Stepper, Stepper, Stepper, Stepper],
        private switches: [Switch, Switch, Switch, Switch, Switch, Switch, Switch, Switch]
    ) {}

    public home = () => {
        if (this.status !== Service.Status.NotMoving) return;

        this.status = Service.Status.Moving;
    };

    public rapidMove = (options: Service.RapidMoveOptions) => {
        const position = options.position;

        if (this.status !== Service.Status.NotMoving) return;

        this.status = Service.Status.Moving;

        this.steppers[0].moveTo({ position: position[0] });
        this.steppers[1].moveTo({ position: position[0] });
        this.steppers[2].moveTo({ position: position[1] });
        this.steppers[3].moveTo({ position: position[2] });
    };

    public linearMove = (options: Service.LinearMoveOptions) => {
        const position = options.position;
        const feedRate = options.feedRate;

        if (this.status !== Service.Status.NotMoving) return;

        this.status = Service.Status.Moving;

        this.steppers[0].moveTo({ position: position[0], feedRate });
        this.steppers[1].moveTo({ position: position[0], feedRate });
        this.steppers[2].moveTo({ position: position[1], feedRate });
        this.steppers[3].moveTo({ position: position[2], feedRate });
    };

    public arcMove = (options: Service.ArcMoveOptions) => {
        options;

        if (this.status !== Service.Status.NotMoving) return;

        this.status = Service.Status.Moving;
    };

    public pause = () => {
        if (this.status !== Service.Status.Moving) return;

        this.status = Service.Status.Paused;
    };

    public resume = () => {
        if (this.status !== Service.Status.Paused) return;

        this.status = Service.Status.Moving;
    };
}

export namespace Service {
    export enum Status {
        Paused,
        Moving,
        NotMoving,
    }

    export type RapidMoveOptions = {
        position: Vector;
    };

    export type LinearMoveOptions = {
        position: Vector;
        feedRate?: number;
    };

    export type ArcMoveOptions =
        | {
              positions: Vector;
              radius: number;
              feedRate?: number;
          }
        | {
              position: Vector;
              centerOffset: Vector;
              feedRate?: number;
          };
}
