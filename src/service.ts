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
    private sensors: Service.Sensors;
    private steppers: Service.Steppers;

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
                stepper: this.steppers.x,
                homeSensor: this.sensors.x.home,
                limitSensor: this.sensors.x.home,
                retractSpeed: 100,
                retractPosition: 100,
            }),

            new Home({
                speed: 1500,
                stepper: this.steppers.y,
                homeSensor: this.sensors.y.home,
                limitSensor: this.sensors.y.home,
                retractSpeed: 100,
                retractPosition: 100,
            }),

            new Home({
                speed: 1500,
                stepper: this.steppers.z,
                homeSensor: this.sensors.z.home,
                limitSensor: this.sensors.z.limit,
                retractSpeed: 100,
                retractPosition: 100,
            }),
        ];
    };

    public linearMove = (gCode: GCode.LinearMove | GCode.RapidMove) => {
        this.status = Service.Status.LinearMoving;

        const currentPosition = new Vector<3>(
            this.steppers.x.position,
            this.steppers.y.position,
            this.steppers.z.position
        );

        const finalPosition = new Vector<3>(
            gCode.x !== undefined ? gCode.x : currentPosition.x,
            gCode.y !== undefined ? gCode.y : currentPosition.y,
            gCode.z !== undefined ? gCode.z : currentPosition.z
        );

        const distance = finalPosition.subtract(currentPosition);
        const speedMagnitude = "f" in gCode && gCode.f !== undefined ? gCode.f : 1500;
        const distanceMagnitude = distance.magnitude;

        const time = distanceMagnitude / speedMagnitude;

        const speed = new Vector<3>(
            Math.abs(distance.x / time),
            Math.abs(distance.y / time),
            Math.abs(distance.z / time)
        );

        this.moves = [
            new LinearMove({
                speed: speed.x,
                stepper: this.steppers.x,
                position: finalPosition.x,
                homeSensor: this.sensors.x.home,
                limitSensor: this.sensors.x.limit,
            }),

            new LinearMove({
                speed: speed.y,
                stepper: this.steppers.y,
                position: finalPosition.y,
                homeSensor: this.sensors.y.home,
                limitSensor: this.sensors.y.limit,
            }),

            new LinearMove({
                speed: speed.z,
                stepper: this.steppers.z,
                position: finalPosition.z,
                homeSensor: this.sensors.z.home,
                limitSensor: this.sensors.z.limit,
            }),
        ];
    };

    public arcMove = (gCode: GCode.ArcMove) => {
        this.status = Service.Status.ArcMoving;

        const currentPosition = new Vector<3>(
            this.steppers.x.position,
            this.steppers.y.position,
            this.steppers.z.position
        );

        const centerPosition = new Vector<3>(
            currentPosition.x + (gCode.i !== undefined ? gCode.i : 0),
            currentPosition.y + (gCode.j !== undefined ? gCode.j : 0),
            currentPosition.z + (gCode.k !== undefined ? gCode.k : 0)
        );

        const finalPosition = new Vector<3>(
            gCode.x !== undefined ? gCode.x : currentPosition.x,
            gCode.y !== undefined ? gCode.y : currentPosition.y,
            gCode.z !== undefined ? gCode.z : currentPosition.z
        );

        const arcX = gCode.i !== undefined ? Coordinate.X : Coordinate.Y;
        const arcY = gCode.j !== undefined ? Coordinate.Y : Coordinate.Z;
        const arcZ = gCode.i === undefined ? Coordinate.X : gCode.j === undefined ? Coordinate.Y : Coordinate.Z;

        const arc = new Arc({
            tolerance: 0.01,
            isClockWise: gCode.g === "02",
            finalPosition: new Vector<2>(finalPosition[arcX], finalPosition[arcY]),
            centerPosition: new Vector<2>(centerPosition[arcX], centerPosition[arcY]),
            initialPosition: new Vector<2>(currentPosition[arcX], currentPosition[arcY]),
        });

        const speedMagnitude = gCode.f !== undefined ? gCode.f : 1500;
        const applicateSpeed = (finalPosition[arcZ] - currentPosition[arcZ]) / (arc.perimeter / speedMagnitude);

        this.moves = [
            new ArcMove({
                arc,
                speed: speedMagnitude,
                stepper: this.steppers[arcX],
                coordinate: Coordinate.X,
                homeSensor: this.sensors[arcX].home,
                limitSensor: this.sensors[arcX].limit,
            }),

            new ArcMove({
                arc,
                speed: speedMagnitude,
                stepper: this.steppers[arcY],
                coordinate: Coordinate.Y,
                homeSensor: this.sensors[arcY].home,
                limitSensor: this.sensors[arcY].limit,
            }),

            new LinearMove({
                speed: applicateSpeed,
                stepper: this.steppers[arcZ],
                position: finalPosition[arcZ],
                homeSensor: this.sensors[arcZ].home,
                limitSensor: this.sensors[arcZ].limit,
            }),
        ];
    };

    public pause = () => {
        const resumeStatus = this.status;
        this.status = Service.Status.Paused;
        this.resume = this.setResume(resumeStatus);
        Object.values(this.steppers).reduce<void>((_, stepper) => stepper.stop(), undefined);
    };

    private setResume = (status: Service.Status) => () => {
        this.status = status;
        Object.values(this.steppers).reduce<void>((_, stepper) => stepper.resume(), undefined);
    };

    public resume: () => void;

    private loop = () => {
        const movesStatus = this.moves.map((move) => move.status);

        if (this.moves.length !== 0 && movesStatus.every((moveStatus) => moveStatus === Move.Status.Finished)) {
            this.moves = [];
            this.status = Service.Status.Idle;

            this.broker.emit("message", this.status);
        }

        if (movesStatus.some((moveStatus) => moveStatus === Move.Status.Broke)) {
            this.moves.reduce<void>((_, move) => move.break(), undefined);
            this.moves = [];
            this.status = Service.Status.SensorTriggered;

            this.broker.emit("message", this.status);
        }

        const currentPosition = new Vector<3>(
            this.steppers.x.position,
            this.steppers.y.position,
            this.steppers.z.position
        );

        if (this.status !== Service.Status.Idle) {
            console.log("message", `X${currentPosition.x} Y${currentPosition.y} Z${currentPosition.z}`);
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
        SensorTriggered = "sensor-triggered",
    }

    export type Options = {
        broker: Broker;
        sensors: Service.Sensors;
        steppers: Service.Steppers;
    };

    export type Sensors = {
        x: { home: Sensor; limit: Sensor };
        y: { home: Sensor; limit: Sensor };
        z: { home: Sensor; limit: Sensor };
    };

    export type Steppers = {
        x: Stepper;
        y: Stepper;
        z: Stepper;
    };
}
