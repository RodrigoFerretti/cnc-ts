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
    private axes: Service.Axes;
    private moves: Move[];
    private status: Service.Status;
    private broker: Broker;

    constructor(options: Service.Options) {
        this.axes = options.axes;
        this.moves = [];
        this.status = Service.Status.Idle;
        this.resume = this.setResume(this.status);
        this.broker = options.broker;

        setInterval(this.loop);
    }

    private getSteppersMaxSpeed = () => Math.min(...Object.values(this.axes).map((axis) => axis.stepper.getMaxSpeed()));

    public getStatus = () => this.status;

    public home = () => {
        this.status = Service.Status.Homing;

        this.moves = [
            new Home({
                speed: this.axes.x.stepper.getMaxSpeed(),
                stepper: this.axes.x.stepper,
                homeSensor: this.axes.x.homeSensor,
                limitSensor: this.axes.x.limitSensor,
                retractSpeed: 100,
                retractPosition: 100,
            }),
            new Home({
                speed: this.axes.y.stepper.getMaxSpeed(),
                stepper: this.axes.y.stepper,
                homeSensor: this.axes.y.homeSensor,
                limitSensor: this.axes.y.limitSensor,
                retractSpeed: 100,
                retractPosition: 100,
            }),
            new Home({
                speed: this.axes.z.stepper.getMaxSpeed(),
                stepper: this.axes.z.stepper,
                homeSensor: this.axes.z.homeSensor,
                limitSensor: this.axes.z.limitSensor,
                retractSpeed: 100,
                retractPosition: 100,
            }),
        ];

        if (this.axes.slave === undefined) return;

        this.moves = [
            ...this.moves,
            new Home({
                speed: this.axes.slave.stepper.getMaxSpeed(),
                stepper: this.axes.slave.stepper,
                homeSensor: this.axes.slave.homeSensor,
                limitSensor: this.axes.slave.limitSensor,
                retractSpeed: 100,
                retractPosition: 100,
            }),
        ];
    };

    public linearMove = (gCode: GCode.LinearMove | GCode.RapidMove) => {
        this.status = Service.Status.LinearMoving;

        const currentPosition = new Vector<3>(
            this.axes.x.stepper.position,
            this.axes.y.stepper.position,
            this.axes.z.stepper.position
        );

        const finalPosition = new Vector<3>(
            gCode.x !== undefined ? gCode.x : currentPosition.x,
            gCode.y !== undefined ? gCode.y : currentPosition.y,
            gCode.z !== undefined ? gCode.z : currentPosition.z
        );

        const distance = Vector.subtract(finalPosition, currentPosition);
        const speedMagnitude = gCode.f !== undefined ? gCode.f : this.getSteppersMaxSpeed();
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

        if (this.axes.slave === undefined) return;

        const slaveCoordinate = this.axes.slave.coordinate;

        this.moves = [
            ...this.moves,
            new LinearMove({
                speed: speed[slaveCoordinate],
                stepper: this.axes.slave.stepper,
                position: finalPosition[slaveCoordinate],
                homeSensor: this.axes.slave.homeSensor,
                limitSensor: this.axes.slave.limitSensor,
            }),
        ];
    };

    public arcMove = (gCode: GCode.ArcMove) => {
        this.status = Service.Status.ArcMoving;

        const currentPosition = new Vector<3>(
            this.axes.x.stepper.position,
            this.axes.y.stepper.position,
            this.axes.z.stepper.position
        );

        const centerOffset = new Vector<3>(gCode.i || 0, gCode.j || 0, gCode.k || 0);
        const centerPosition = Vector.add(currentPosition, centerOffset);

        const finalPosition = new Vector<3>(
            gCode.x !== undefined ? gCode.x : currentPosition.x,
            gCode.y !== undefined ? gCode.y : currentPosition.y,
            gCode.z !== undefined ? gCode.z : currentPosition.z
        );

        const arcX = gCode.i !== undefined ? Coordinate.X : Coordinate.Y;
        const arcY = gCode.j !== undefined ? Coordinate.Y : Coordinate.Z;
        const arcZ = gCode.i === undefined ? Coordinate.X : gCode.j === undefined ? Coordinate.Y : Coordinate.Z;

        const arc = new Arc({
            resolution: 1,
            isClockWise: gCode.command === GCode.Command.G02,
            finalPosition: new Vector<2>(finalPosition[arcX], finalPosition[arcY]),
            centerPosition: new Vector<2>(centerPosition[arcX], centerPosition[arcY]),
            initialPosition: new Vector<2>(currentPosition[arcX], currentPosition[arcY]),
        });

        const speedMagnitude = gCode.f !== undefined ? gCode.f : this.getSteppersMaxSpeed();
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

        if (this.axes.slave === undefined) return;

        const slaveCoordinate = this.axes.slave.coordinate;

        this.moves = [
            ...this.moves,
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
        ];
    };

    public pause = () => {
        const resumeStatus = this.status;
        this.status = Service.Status.Paused;
        this.resume = this.setResume(resumeStatus);
        Object.values(this.axes).reduce<void>((_, axis) => axis.stepper.stop(), undefined);
    };

    private setResume = (status: Service.Status) => () => {
        this.status = status;
        Object.values(this.axes).reduce<void>((_, axis) => axis.stepper.resume(), undefined);
    };

    public resume: () => void;

    private loop = () => {
        const movesStatus = this.moves.map((move) => move.status);

        if (this.moves.length !== 0 && movesStatus.every((moveStatus) => moveStatus === Move.Status.Finished)) {
            this.moves = [];
            this.status = Service.Status.Idle;

            this.broker.emit(Broker.Event.Message, this.status);
        }

        if (movesStatus.some((moveStatus) => moveStatus === Move.Status.Broke)) {
            this.moves.reduce<void>((_, move) => move.break(), undefined);
            this.moves = [];
            this.status = Service.Status.SensorTriggered;

            this.broker.emit(Broker.Event.Message, this.status);
        }

        const currentPosition = new Vector<3>(
            this.axes.x.stepper.position,
            this.axes.y.stepper.position,
            this.axes.z.stepper.position
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
        axes: Axes;
        broker: Broker;
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
}
