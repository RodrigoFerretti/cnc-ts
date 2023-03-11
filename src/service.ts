import { Arc } from "./arc";
import { GCode } from "./gcode";
import { Stepper } from "./stepper";
import { Switch } from "./switch";
import { Vector } from "./vector";

export class Service {
    private status: Service.Status = Service.Status.NotMoving;
    private arcMaxVelocity: number = 0;

    constructor(
        private steppers: [Stepper, Stepper, Stepper],
        private switches: [Switch, Switch, Switch, Switch, Switch, Switch]
    ) {
        this.switches;
    }

    public home: Service.Handler<GCode.Home> = () => {
        if (this.status !== Service.Status.NotMoving) return "can only move when not moving";

        this.status = Service.Status.Moving;

        return this.status;
    };

    public rapidMove: Service.Handler<GCode.RapidMove> = (gCode) => {
        if (this.status !== Service.Status.NotMoving) return "can only move when not moving";

        this.status = Service.Status.Moving;

        const currentPosition: Vector<3> = [
            this.steppers[0].getPosition(),
            this.steppers[1].getPosition(),
            this.steppers[2].getPosition(),
        ];

        const finalPosition: Vector<3> = [
            gCode.x || currentPosition[0],
            gCode.y || currentPosition[1],
            gCode.z || currentPosition[2],
        ];

        this.steppers[0].linearMove({ position: finalPosition[0] });
        this.steppers[1].linearMove({ position: finalPosition[1] });
        this.steppers[2].linearMove({ position: finalPosition[2] });

        return this.status;
    };

    public linearMove: Service.Handler<GCode.LinearMove> = (gCode) => {
        if (this.status !== Service.Status.NotMoving) return "can only move when not moving";

        this.status = Service.Status.Moving;

        const currentPosition: Vector<3> = [
            this.steppers[0].getPosition(),
            this.steppers[1].getPosition(),
            this.steppers[2].getPosition(),
        ];

        const finalPosition: Vector<3> = [
            gCode.x || currentPosition[0],
            gCode.y || currentPosition[1],
            gCode.z || currentPosition[2],
        ];

        const speed = gCode.f;

        this.steppers[0].linearMove({ position: finalPosition[0], speed });
        this.steppers[1].linearMove({ position: finalPosition[1], speed });
        this.steppers[2].linearMove({ position: finalPosition[2], speed });

        return this.status;
    };

    public arcMove: Service.Handler<GCode.ArcMove> = (gCode) => {
        if (this.status !== Service.Status.NotMoving) return "can only move when not moving";

        this.status = Service.Status.Moving;

        const currentPosition: Vector<3> = [
            this.steppers[0].getPosition(),
            this.steppers[1].getPosition(),
            this.steppers[2].getPosition(),
        ];

        const centerPosition: Vector<3> = [
            currentPosition[0] + (gCode.i || 0),
            currentPosition[1] + (gCode.j || 0),
            currentPosition[2] + (gCode.k || 0),
        ];

        const finalPosition: Vector<3> = [
            gCode.x || currentPosition[0],
            gCode.y || currentPosition[1],
            gCode.z || currentPosition[2],
        ];

        const abscissa = gCode.i !== undefined ? 0 : 1;
        const ordinate = gCode.j !== undefined ? 1 : 2;
        const applicate = gCode.i === undefined ? 0 : gCode.j === undefined ? 1 : 2;

        const arcSpeed = this.arcMaxVelocity > gCode.f! ? gCode.f! : this.arcMaxVelocity;
        const applicateSpeed = arcSpeed;

        const arc = new Arc({
            initialPosition: [currentPosition[abscissa], currentPosition[ordinate]],
            centerPosition: [centerPosition[abscissa], centerPosition[ordinate]],
            finalPosition: [finalPosition[abscissa], finalPosition[ordinate]],
            isClockWise: gCode.g === "02",
            speed: arcSpeed,
        });

        this.steppers[abscissa].arcMove({ arc, axis: 0 });
        this.steppers[ordinate].arcMove({ arc, axis: 1 });
        this.steppers[applicate].linearMove({ position: finalPosition[applicate], speed: applicateSpeed });

        return this.status;
    };

    public pause: Service.Handler<GCode.Pause> = () => {
        if (this.status !== Service.Status.Moving) return "can only pause when moving";

        this.status = Service.Status.Paused;

        return this.status;
    };

    public resume: Service.Handler<GCode.Resume> = () => {
        if (this.status !== Service.Status.Paused) "can only resume when paused";

        this.status = Service.Status.Moving;

        return this.status;
    };
}

export namespace Service {
    export enum Status {
        Paused = "paused",
        Moving = "moving",
        NotMoving = "not-moving",
    }

    export type Handler<G extends GCode = any> = (gCode: G) => string;
}
