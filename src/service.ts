import { Arc } from "./arc";
import { ArcMove } from "./arc-move";
import { Broker } from "./broker";
import { Coordinate } from "./coodinate";
import { GCode } from "./gcode";
import { Home } from "./home";
import { LinearMove } from "./linear-move";
import { Move } from "./move";
import { Sensor } from "./sensor";
import { Stepper } from "./stepper";
import { Vector } from "./vector";

export class Service {
    private moves: Move[];
    private status: Service.Status;
    private broker: Broker;
    private sensors: [Sensor, Sensor, Sensor, Sensor, Sensor, Sensor];
    private steppers: [Stepper, Stepper, Stepper];

    constructor(options: Service.Options) {
        this.moves = [];
        this.status = Service.Status.Idle;
        this.resume = this.setResume(this.status);
        this.broker = options.broker;
        this.sensors = options.sensors;
        this.steppers = options.steppers;

        setInterval(this.loop);
    }

    public getStatus = () => this.status;

    public home = () => {
        this.status = Service.Status.Homing;

        this.moves = [
            new Home({
                speed: 1500,
                stepper: this.steppers[0],
                homeSensor: this.sensors[0],
                limitSensor: this.sensors[1],
                retractSpeed: 100,
                retractPosition: 100,
            }),

            new Home({
                speed: 1500,
                stepper: this.steppers[1],
                homeSensor: this.sensors[2],
                limitSensor: this.sensors[3],
                retractSpeed: 100,
                retractPosition: 100,
            }),

            new Home({
                speed: 1500,
                stepper: this.steppers[2],
                homeSensor: this.sensors[4],
                limitSensor: this.sensors[5],
                retractSpeed: 100,
                retractPosition: 100,
            }),
        ];
    };

    public linearMove = (gCode: GCode.LinearMove | GCode.RapidMove) => {
        this.status = Service.Status.LinearMoving;

        const currentPosition: Vector<3> = [
            this.steppers[0].getPosition(),
            this.steppers[1].getPosition(),
            this.steppers[2].getPosition(),
        ];

        const finalPosition: Vector<3> = [
            gCode.x !== undefined ? gCode.x : currentPosition[0],
            gCode.y !== undefined ? gCode.y : currentPosition[1],
            gCode.z !== undefined ? gCode.z : currentPosition[2],
        ];

        const distance: Vector<3> = [
            finalPosition[0] - currentPosition[0],
            finalPosition[1] - currentPosition[1],
            finalPosition[2] - currentPosition[2],
        ];

        const speedMagnitude = "f" in gCode && gCode.f !== undefined ? gCode.f : 1500;
        const distanceMagnitude = Math.sqrt(
            Math.pow(distance[0], 2) + Math.pow(distance[1], 2) + Math.pow(distance[2], 2)
        );

        const time = distanceMagnitude / speedMagnitude;

        const speed: Vector<3> = [
            Math.abs(distance[0] / time),
            Math.abs(distance[1] / time),
            Math.abs(distance[2] / time),
        ];

        this.moves = [
            new LinearMove({
                speed: speed[0],
                stepper: this.steppers[0],
                position: finalPosition[0],
                homeSensor: this.sensors[0],
                limitSensor: this.sensors[1],
            }),

            new LinearMove({
                speed: speed[1],
                stepper: this.steppers[1],
                position: finalPosition[1],
                homeSensor: this.sensors[2],
                limitSensor: this.sensors[3],
            }),

            new LinearMove({
                speed: speed[2],
                stepper: this.steppers[2],
                position: finalPosition[2],
                homeSensor: this.sensors[4],
                limitSensor: this.sensors[5],
            }),
        ];
    };

    public arcMove = (gCode: GCode.ArcMove) => {
        this.status = Service.Status.ArcMoving;

        const currentPosition: Vector<3> = [
            this.steppers[0].getPosition(),
            this.steppers[1].getPosition(),
            this.steppers[2].getPosition(),
        ];

        const centerPosition: Vector<3> = [
            currentPosition[0] + (gCode.i !== undefined ? gCode.i : 0),
            currentPosition[1] + (gCode.j !== undefined ? gCode.j : 0),
            currentPosition[2] + (gCode.k !== undefined ? gCode.k : 0),
        ];

        const finalPosition: Vector<3> = [
            gCode.x !== undefined ? gCode.x : currentPosition[0],
            gCode.y !== undefined ? gCode.y : currentPosition[1],
            gCode.z !== undefined ? gCode.z : currentPosition[2],
        ];

        const abscissa = gCode.i !== undefined ? 0 : 1;
        const ordinate = gCode.j !== undefined ? 1 : 2;
        const applicate = gCode.i === undefined ? 0 : gCode.j === undefined ? 1 : 2;

        const arc = new Arc({
            tolerance: 0.01,
            isClockWise: gCode.g === "02",
            finalPosition: [finalPosition[abscissa], finalPosition[ordinate]],
            centerPosition: [centerPosition[abscissa], centerPosition[ordinate]],
            initialPosition: [currentPosition[abscissa], currentPosition[ordinate]],
        });

        const speedMagnitude = gCode.f !== undefined ? gCode.f : 1500;
        const applicateSpeed =
            (finalPosition[applicate] - currentPosition[applicate]) / (arc.getPerimeter() / speedMagnitude);

        this.moves = [
            new ArcMove({
                arc,
                speed: speedMagnitude,
                stepper: this.steppers[abscissa],
                coordinate: Coordinate.Abscissa,
                homeSensor: this.sensors[abscissa],
                limitSensor: this.sensors[abscissa + 1],
            }),

            new ArcMove({
                arc,
                speed: speedMagnitude,
                stepper: this.steppers[ordinate],
                coordinate: Coordinate.Ordinate,
                homeSensor: this.sensors[ordinate],
                limitSensor: this.sensors[ordinate + 1],
            }),

            new LinearMove({
                speed: applicateSpeed,
                stepper: this.steppers[applicate],
                position: finalPosition[applicate],
                homeSensor: this.sensors[applicate],
                limitSensor: this.sensors[applicate + 1],
            }),
        ];
    };

    public pause = () => {
        const resumeStatus = this.status;
        this.status = Service.Status.Paused;
        this.resume = this.setResume(resumeStatus);
        this.steppers.reduce<void>((_, stepper) => stepper.stop(), undefined);
    };

    private setResume = (status: Service.Status) => () => {
        this.status = status;
        this.steppers.reduce<void>((_, stepper) => stepper.resume(), undefined);
    };

    public resume: () => void;

    private loop = () => {
        const movesStatus = this.moves.map((move) => move.getStatus());

        if (this.moves.length !== 0 && movesStatus.every((moveStatus) => moveStatus === Move.Status.Finished)) {
            this.moves = [];
            this.status = Service.Status.Idle;

            this.broker.emit("message", this.status);
        }

        const currentPosition: Vector<3> = [
            this.steppers[0].getPosition(),
            this.steppers[1].getPosition(),
            this.steppers[2].getPosition(),
        ];

        if (this.status !== Service.Status.Idle) {
            console.log("message", `X${currentPosition[0]} Y${currentPosition[1]} Z${currentPosition[2]}`);
        }
    };
}

export namespace Service {
    export enum Status {
        Idle = "idle",
        Homing = "homing",
        Paused = "paused",
        ArcMoving = "arc-moving",
        RapidMoving = "rapid-moving",
        LinearMoving = "linear-moving",
    }

    export type Options = {
        broker: Broker;
        sensors: [Sensor, Sensor, Sensor, Sensor, Sensor, Sensor];
        steppers: [Stepper, Stepper, Stepper];
    };
}
