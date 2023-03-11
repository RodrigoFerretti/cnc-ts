import { Arc } from "./lib/arc";
import { GCode } from "./gcode";
import { Stepper } from "./stepper";
import { Sensor } from "./sensor";
import { Vector } from "./lib/vector";

export class Service {
    private status: Service.Status;
    private sensors: [Sensor, Sensor, Sensor, Sensor, Sensor, Sensor];
    private steppers: [Stepper, Stepper, Stepper];
    private arcMaxVelocity: number;

    constructor(options: Service.Options) {
        this.status = Service.Status.NotMoving;
        this.sensors = options.sensors;
        this.steppers = options.steppers;
        this.arcMaxVelocity = 0;

        this.sensors;
    }

    public home: Service.Handler<GCode.Home> = () => {
        if (this.status !== Service.Status.NotMoving) return "can only move when not moving";

        this.status = Service.Status.Homing;

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

        [arc, applicate, applicateSpeed];

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
    export type Options = {
        steppers: [Stepper, Stepper, Stepper];
        sensors: [Sensor, Sensor, Sensor, Sensor, Sensor, Sensor];
    };

    export enum Status {
        Paused = "paused",
        Moving = "moving",
        Homing = "homing",
        NotMoving = "not-moving",
    }

    export type Handler<G extends GCode = any> = (gCode: G) => string;
}
