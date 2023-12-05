import { Gpio } from "pigpio";
import { Stepper } from "../io/stepper";
import { Arc } from "../math/arc";
import { Coordinate } from "../math/coodinate";
import { Vector } from "../math/vector";
import { ArcMove } from "../move/arc-move";
import { Home } from "../move/home";
import { LinearMove } from "../move/linear-move";
import { Move } from "../move/move";
import { GCode } from "./gcode";

export class Service {
    public status: Service.Status;
    public gcode: Record<GCode.Command, Service.Handler>;
    private moves: Move[];

    constructor(public axes: Service.Axes) {
        this.moves = [];
        this.status = Service.Status.Idle;
        this.resume = this.setResume(this.status);

        setInterval(this.loop);

        this.gcode = {
            [GCode.Command.G00]: this.linearMove,
            [GCode.Command.G01]: this.linearMove,
            [GCode.Command.G02]: this.arcMove,
            [GCode.Command.G03]: this.arcMove,
            [GCode.Command.G28]: this.home,
            [GCode.Command.M00]: this.pause,
            [GCode.Command.M99]: this.resume,
        };
    }

    private home = () => {
        this.status = Service.Status.Homing;

        this.moves = [
            new Home({
                speed: 2000,
                stepper: this.axes.x.stepper,
                homeSensor: this.axes.x.homeSensor,
                limitSensor: this.axes.x.limitSensor,
                retractSpeed: 500,
                retractPosition: 1000,
            }),
            new Home({
                speed: 2000,
                stepper: this.axes.y.stepper,
                homeSensor: this.axes.y.homeSensor,
                limitSensor: this.axes.y.limitSensor,
                retractSpeed: 500,
                retractPosition: 1000,
            }),
            new Home({
                speed: 2000,
                stepper: this.axes.z.stepper,
                homeSensor: this.axes.z.homeSensor,
                limitSensor: this.axes.z.limitSensor,
                retractSpeed: 500,
                retractPosition: 1000,
            }),
        ];
    };

    private linearMove = (gCode: GCode.LinearMove | GCode.RapidMove) => {
        this.status = Service.Status.LinearMoving;

        const currentPosition = new Vector<3>(
            this.axes.x.stepper.position,
            this.axes.y.stepper.position,
            this.axes.z.stepper.position,
        );

        const finalPosition = new Vector<3>(
            gCode.x !== undefined ? gCode.x : currentPosition.x,
            gCode.y !== undefined ? gCode.y : currentPosition.y,
            gCode.z !== undefined ? gCode.z : currentPosition.z,
        );

        const distance = Vector.subtract(finalPosition, currentPosition);

        const maxTime = new Vector<3>(
            distance.x / this.axes.x.stepper.maxSpeed,
            distance.y / this.axes.y.stepper.maxSpeed,
            distance.z / this.axes.z.stepper.maxSpeed,
        );

        const distanceMagnitude = distance.magnitude;
        const time = gCode.f ? distanceMagnitude / gCode.f : Math.max(maxTime.x, maxTime.y, maxTime.z);

        const speed = new Vector<3>(
            Math.abs(distance.x / time),
            Math.abs(distance.y / time),
            Math.abs(distance.z / time),
        );

        this.moves = [
            new LinearMove({
                speed: speed.x,
                stepper: this.axes.x.stepper,
                position: finalPosition.x,
                homeSensor: distance.x > 0 ? [] : this.axes.x.homeSensor,
                limitSensor: distance.x > 0 ? this.axes.x.limitSensor : [],
            }),
            new LinearMove({
                speed: speed.y,
                stepper: this.axes.y.stepper,
                position: finalPosition.y,
                homeSensor: distance.y > 0 ? [] : this.axes.y.homeSensor,
                limitSensor: distance.y > 0 ? this.axes.y.limitSensor : [],
            }),
            new LinearMove({
                speed: speed.z,
                stepper: this.axes.z.stepper,
                position: finalPosition.z,
                homeSensor: distance.z > 0 ? [] : this.axes.z.homeSensor,
                limitSensor: distance.z > 0 ? this.axes.z.limitSensor : [],
            }),
        ];
    };

    private arcMove = (gCode: GCode.ArcMove) => {
        this.status = Service.Status.ArcMoving;

        const currentPosition = new Vector<3>(
            this.axes.x.stepper.position,
            this.axes.y.stepper.position,
            this.axes.z.stepper.position,
        );

        const centerOffset = new Vector<3>(gCode.i || 0, gCode.j || 0, gCode.k || 0);
        const centerPosition = Vector.add(currentPosition, centerOffset);

        const finalPosition = new Vector<3>(
            gCode.x !== undefined ? gCode.x : currentPosition.x,
            gCode.y !== undefined ? gCode.y : currentPosition.y,
            gCode.z !== undefined ? gCode.z : currentPosition.z,
        );

        const distance = Vector.subtract(finalPosition, currentPosition);

        const arcX = gCode.i !== undefined ? Coordinate.X : Coordinate.Y;
        const arcY = gCode.j !== undefined ? Coordinate.Y : Coordinate.Z;
        const arcZ = gCode.i === undefined ? Coordinate.X : gCode.j === undefined ? Coordinate.Y : Coordinate.Z;

        const arc = new Arc({
            resolution: 0.01,
            isClockWise: gCode.command === GCode.Command.G02,
            finalPosition: new Vector<2>(finalPosition[arcX], finalPosition[arcY]),
            centerPosition: new Vector<2>(centerPosition[arcX], centerPosition[arcY]),
            initialPosition: new Vector<2>(currentPosition[arcX], currentPosition[arcY]),
        });

        const speedMagnitude = gCode.f!;
        const linearMoveSpeed = (finalPosition[arcZ] - currentPosition[arcZ]) / (arc.perimeter / speedMagnitude);

        this.moves = [
            new ArcMove({
                arc,
                speed: speedMagnitude,
                stepper: this.axes[arcX].stepper,
                coordinate: Coordinate.X,
                homeSensor: this.axes[arcX].homeSensor,
                limitSensor: this.axes[arcX].limitSensor,
            }),
            new ArcMove({
                arc,
                speed: speedMagnitude,
                stepper: this.axes[arcY].stepper,
                coordinate: Coordinate.Y,
                homeSensor: this.axes[arcY].homeSensor,
                limitSensor: this.axes[arcY].limitSensor,
            }),
            new LinearMove({
                speed: linearMoveSpeed,
                stepper: this.axes[arcZ].stepper,
                position: finalPosition[arcZ],
                homeSensor: distance[arcZ] > 0 ? [] : this.axes[arcZ].homeSensor,
                limitSensor: distance[arcZ] > 0 ? this.axes[arcZ].limitSensor : [],
            }),
        ];
    };

    private pause = () => {
        const resumeStatus = this.status;
        this.status = Service.Status.Paused;
        this.resume = this.setResume(resumeStatus);
        Object.values(this.axes).forEach((axis) => axis.stepper.stop());
    };

    private setResume = (status: Service.Status) => () => {
        this.status = status;
        Object.values(this.axes).forEach((axis) => axis.stepper.resume());
    };

    private resume: () => void;

    private loop = () => {
        const movesStatus = this.moves.map((move) => move.status);

        if (this.moves.length !== 0 && movesStatus.every((moveStatus) => moveStatus === Move.Status.Finished)) {
            this.moves = [];
            this.status = Service.Status.Idle;
        }

        if (movesStatus.some((moveStatus) => moveStatus === Move.Status.Broke)) {
            this.moves.forEach((move) => move.break());
            this.moves = [];
            this.status = Service.Status.SensorTriggered;
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
        axes: Axes;
    };

    export type Axes = Record<Coordinate, Axis>;

    export type Axis = {
        stepper: Stepper;
        homeSensor: Gpio[];
        limitSensor: Gpio[];
    };

    export type Handler<T extends GCode = any> = (gCode: T) => void;
}
