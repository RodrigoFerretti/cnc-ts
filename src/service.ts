import { Arc } from "./arc";
import { ArcMove } from "./arc-move";
import { Broker } from "./broker";
import { Coordinate } from "./coodinate";
import { GCode } from "./gcode";
import { Home } from "./home";
import { I2C } from "./i2c";
import { LinearMove } from "./linear-move";
import { Move } from "./move";
import { Sensor } from "./sensor";
import { Stepper } from "./stepper";
import { Vector } from "./vector";

export class Service {
    private i2c: I2C;
    private moves: Move[];
    private status: Service.Status;
    private broker: Broker;
    private sensors: [Sensor, Sensor, Sensor, Sensor, Sensor, Sensor];
    private steppers: [Stepper, Stepper, Stepper];
    private loopStatus: Service.LoopStatus;

    constructor(options: Service.Options) {
        this.i2c = options.i2c;
        this.moves = [];
        this.status = Service.Status.Idle;
        this.broker = options.broker;
        this.sensors = options.sensors;
        this.steppers = options.steppers;
        this.loopStatus = Service.LoopStatus.Clear;

        setInterval(() => {
            if (this.loopStatus === Service.LoopStatus.Running) return;
            this.loop();
        });
    }

    public getStatus = () => {
        return this.status;
    };

    public home = () => {
        this.status = Service.Status.Homing;

        this.moves = [
            new Home({
                speed: 100,
                stepper: this.steppers[0],
                sensors: [this.sensors[0], this.sensors[1]],
                retractPosition: 100,
            }),

            new Home({
                speed: 100,
                stepper: this.steppers[1],
                sensors: [this.sensors[2], this.sensors[3]],
                retractPosition: 100,
            }),

            new Home({
                speed: 100,
                stepper: this.steppers[2],
                sensors: [this.sensors[4], this.sensors[5]],
                retractPosition: 100,
            }),
        ];
    };

    public rapidMove = (gCode: GCode.RapidMove) => {
        this.status = Service.Status.RapidMoving;

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

        const distanceMagnitude = Math.sqrt(
            Math.pow(distance[0], 2) + Math.pow(distance[1], 2) + Math.pow(distance[2], 2)
        );

        const speedMagnitude = 200;

        const time = Math.ceil(distanceMagnitude / speedMagnitude) * 1000;

        const speed: Vector<3> = [distance[0] / time, distance[1] / time, distance[2] / time];

        this.moves = [
            new LinearMove({
                speed: speed[0],
                stepper: this.steppers[0],
                sensors: [this.sensors[0], this.sensors[1]],
                position: finalPosition[0],
            }),

            new LinearMove({
                speed: speed[1],
                stepper: this.steppers[1],
                sensors: [this.sensors[2], this.sensors[3]],
                position: finalPosition[1],
            }),

            new LinearMove({
                speed: speed[2],
                stepper: this.steppers[2],
                sensors: [this.sensors[4], this.sensors[5]],
                position: finalPosition[2],
            }),
        ];
    };

    public linearMove = (gCode: GCode.LinearMove) => {
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

        const distanceMagnitude = Math.sqrt(
            Math.pow(distance[0], 2) + Math.pow(distance[1], 2) + Math.pow(distance[2], 2)
        );

        const speedMagnitude = gCode.f || 200;

        const time = Math.ceil(distanceMagnitude / speedMagnitude) * 1000;

        const speed: Vector<3> = [distance[0] / time, distance[1] / time, distance[2] / time];

        this.moves = [
            new LinearMove({
                speed: speed[0],
                stepper: this.steppers[0],
                sensors: [this.sensors[0], this.sensors[1]],
                position: finalPosition[0],
            }),

            new LinearMove({
                speed: speed[1],
                stepper: this.steppers[1],
                sensors: [this.sensors[2], this.sensors[3]],
                position: finalPosition[1],
            }),

            new LinearMove({
                speed: speed[2],
                stepper: this.steppers[2],
                sensors: [this.sensors[4], this.sensors[5]],
                position: finalPosition[2],
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
            isClockWise: gCode.g === "02",
            finalPosition: [finalPosition[abscissa], finalPosition[ordinate]],
            centerPosition: [centerPosition[abscissa], centerPosition[ordinate]],
            initialPosition: [currentPosition[abscissa], currentPosition[ordinate]],
        });

        const speed = gCode.f || 200;

        this.moves = [
            new ArcMove({
                arc,
                speed,
                stepper: this.steppers[abscissa],
                sensors: [this.sensors[abscissa], this.sensors[abscissa + 1]],
                coordinate: Coordinate.Abscissa,
            }),

            new ArcMove({
                arc,
                speed,
                stepper: this.steppers[ordinate],
                sensors: [this.sensors[ordinate], this.sensors[ordinate + 1]],
                coordinate: Coordinate.Ordinate,
            }),

            new LinearMove({
                speed,
                stepper: this.steppers[applicate],
                sensors: [this.sensors[applicate], this.sensors[applicate + 1]],
                position: finalPosition[applicate],
            }),
        ];
    };

    public pause = () => {
        const resumeStatus = this.status;
        this.status = Service.Status.Paused;

        this.resume = () => {
            this.status = resumeStatus;
        };
    };

    public resume = () => {};

    private loop = () => {
        this.loopStatus = Service.LoopStatus.Running;

        this.i2c.read();

        this.moves.reduce<void>((_, move) => {
            move.loop();
        }, undefined);

        const movesStatus = this.moves.map((move) => move.getStatus());

        if (this.moves.length !== 0 && movesStatus.every((moveStatus) => moveStatus === Move.Status.Completed)) {
            this.status = Service.Status.Idle;
            this.moves = [];

            this.broker.emit("message", this.status);
        }

        if (movesStatus.some((movesStatus) => movesStatus === Move.Status.SensorStopped)) {
            this.status = Service.Status.SensorStopped;
            this.moves = [];

            this.broker.emit("message", this.status);
        }

        const currentPosition: Vector<3> = [
            this.steppers[0].getPosition(),
            this.steppers[1].getPosition(),
            this.steppers[2].getPosition(),
        ];

        if (this.status !== Service.Status.Idle) {
            console.log(`x: ${currentPosition[0]} y: ${currentPosition[1]} z: ${currentPosition[2]}`);
        }

        this.loopStatus = Service.LoopStatus.Clear;
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
        SensorStopped = "sensor-stopped",
    }

    export enum LoopStatus {
        Clear = "clear",
        Running = "running",
    }

    export type Options = {
        i2c: I2C;
        broker: Broker;
        sensors: [Sensor, Sensor, Sensor, Sensor, Sensor, Sensor];
        steppers: [Stepper, Stepper, Stepper];
    };
}
