import { Sensor } from "../io/sensor";
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
    public gcode: Record<GCode.Command, Service.Handler>;

    private moves: Move[];
    private currentStatus: Service.Status;

    constructor(public axes: Service.Axes) {
        this.moves = [];
        this.currentStatus = Service.Status.Idle;
        this.resume = this.setResume(this.currentStatus);

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

    public get status() {
        return this.currentStatus;
    }

    private get stepperMaxSpeed() {
        return Math.min(...Object.values(this.axes).map((axis) => axis.stepper.getMaxSpeed()));
    }

    private home = () => {
        this.currentStatus = Service.Status.Homing;

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

        if (this.axes.slave === undefined) {
            return;
        }

        this.moves.push(
            new Home({
                speed: 2000,
                stepper: this.axes.slave.stepper,
                homeSensor: this.axes.slave.homeSensor,
                limitSensor: this.axes.slave.limitSensor,
                retractSpeed: 500,
                retractPosition: 1000,
            }),
        );
    };

    private linearMove = (gCode: GCode.LinearMove | GCode.RapidMove) => {
        this.currentStatus = Service.Status.LinearMoving;

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
        const speedMagnitude = gCode.f || this.stepperMaxSpeed;
        const distanceMagnitude = distance.magnitude;

        const time = distanceMagnitude / speedMagnitude;

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
                homeSensor: this.axes.x.homeSensor,
                limitSensor: this.axes.x.limitSensor,
            }),
            new LinearMove({
                speed: speed.y,
                stepper: this.axes.y.stepper,
                position: finalPosition.y,
                homeSensor: this.axes.y.homeSensor,
                limitSensor: this.axes.y.limitSensor,
            }),
            new LinearMove({
                speed: speed.z,
                stepper: this.axes.z.stepper,
                position: finalPosition.z,
                homeSensor: this.axes.z.homeSensor,
                limitSensor: this.axes.z.limitSensor,
            }),
        ];

        if (this.axes.slave === undefined) {
            return;
        }

        const slaveCoordinate = this.axes.slave.coordinate;

        this.moves.push(
            new LinearMove({
                speed: speed[slaveCoordinate],
                stepper: this.axes.slave.stepper,
                position: finalPosition[slaveCoordinate],
                homeSensor: this.axes.slave.homeSensor,
                limitSensor: this.axes.slave.limitSensor,
            }),
        );
    };

    private arcMove = (gCode: GCode.ArcMove) => {
        this.currentStatus = Service.Status.ArcMoving;

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

        const speedMagnitude = gCode.f || this.stepperMaxSpeed;
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
                homeSensor: this.axes[arcZ].homeSensor,
                limitSensor: this.axes[arcZ].limitSensor,
            }),
        ];

        if (this.axes.slave === undefined) {
            return;
        }

        const slaveCoordinate = this.axes.slave.coordinate;

        this.moves.push(
            slaveCoordinate === arcZ
                ? new LinearMove({
                      speed: linearMoveSpeed,
                      stepper: this.axes.slave.stepper,
                      position: finalPosition[slaveCoordinate],
                      homeSensor: this.axes.slave.homeSensor,
                      limitSensor: this.axes.slave.limitSensor,
                  })
                : new ArcMove({
                      arc,
                      speed: speedMagnitude,
                      stepper: this.axes.slave.stepper,
                      coordinate: slaveCoordinate === arcX ? Coordinate.X : Coordinate.Y,
                      homeSensor: this.axes.slave.homeSensor,
                      limitSensor: this.axes.slave.limitSensor,
                  }),
        );
    };

    private pause = () => {
        const resumeStatus = this.currentStatus;
        this.currentStatus = Service.Status.Paused;
        this.resume = this.setResume(resumeStatus);
        Object.values(this.axes).forEach((axis) => axis.stepper.stop());
    };

    private setResume = (status: Service.Status) => () => {
        this.currentStatus = status;
        Object.values(this.axes).forEach((axis) => axis.stepper.resume());
    };

    private resume: () => void;

    private loop = () => {
        const movesStatus = this.moves.map((move) => move.status);

        if (this.moves.length !== 0 && movesStatus.every((moveStatus) => moveStatus === Move.Status.Finished)) {
            this.moves = [];
            this.currentStatus = Service.Status.Idle;
        }

        if (movesStatus.some((moveStatus) => moveStatus === Move.Status.Broke)) {
            this.moves.forEach((move) => move.break());
            this.moves = [];
            this.currentStatus = Service.Status.SensorTriggered;
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

    export type Axes = {
        slave?: SlaveAxis;
    } & Record<Coordinate, Axis>;

    export type Axis = {
        stepper: Stepper;
        homeSensor: Sensor;
        limitSensor: Sensor;
    };

    export type SlaveAxis = {
        coordinate: Coordinate;
    } & Axis;

    export type Handler<T extends GCode = any> = (gCode: T) => void;
}
