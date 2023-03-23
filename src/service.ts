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

    constructor(options: Service.Options) {
        this.i2c = options.i2c;
        this.moves = [];
        this.status = Service.Status.Idle;
        this.broker = options.broker;
        this.sensors = options.sensors;
        this.steppers = options.steppers;

        setInterval(this.loop);
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
            gCode.x || currentPosition[0],
            gCode.y || currentPosition[1],
            gCode.z || currentPosition[2],
        ];

        this.moves = [
            new LinearMove({
                stepper: this.steppers[0],
                sensors: [this.sensors[0], this.sensors[1]],
                position: finalPosition[0],
            }),

            new LinearMove({
                stepper: this.steppers[1],
                sensors: [this.sensors[2], this.sensors[3]],
                position: finalPosition[1],
            }),

            new LinearMove({
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
            gCode.x || currentPosition[0],
            gCode.y || currentPosition[1],
            gCode.z || currentPosition[2],
        ];

        const speed = gCode.f;

        this.moves = [
            new LinearMove({
                stepper: this.steppers[0],
                sensors: [this.sensors[0], this.sensors[1]],
                position: finalPosition[0],
                speed,
            }),

            new LinearMove({
                stepper: this.steppers[1],
                sensors: [this.sensors[2], this.sensors[3]],
                position: finalPosition[1],
                speed,
            }),

            new LinearMove({
                stepper: this.steppers[2],
                sensors: [this.sensors[4], this.sensors[5]],
                position: finalPosition[2],
                speed,
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

        const arc = new Arc({
            isClockWise: gCode.g === "02",
            finalPosition: [finalPosition[abscissa], finalPosition[ordinate]],
            centerPosition: [centerPosition[abscissa], centerPosition[ordinate]],
            initialPosition: [currentPosition[abscissa], currentPosition[ordinate]],
        });

        const speed = gCode.f;

        this.moves = [
            new ArcMove({
                arc,
                stepper: this.steppers[abscissa],
                sensors: [this.sensors[abscissa], this.sensors[abscissa + 1]],
                coordinate: Coordinate.Abscissa,
                speed,
            }),

            new ArcMove({
                arc,
                stepper: this.steppers[ordinate],
                sensors: [this.sensors[ordinate], this.sensors[ordinate + 1]],
                coordinate: Coordinate.Ordinate,
                speed,
            }),

            new LinearMove({
                stepper: this.steppers[applicate],
                position: finalPosition[applicate],
                sensors: [this.sensors[applicate], this.sensors[applicate + 1]],
                speed,
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

    export type Options = {
        i2c: I2C;
        sensors: [Sensor, Sensor, Sensor, Sensor, Sensor, Sensor];
        broker: Broker;
        steppers: [Stepper, Stepper, Stepper];
    };
}
