import { Sensor } from "./sensor";
import { Stepper } from "./stepper";

export abstract class Move {
    protected speed: number;
    protected status: Move.Status;
    protected stepper: Stepper;
    protected sensors: [Sensor, Sensor];

    public constructor(options: Move.Options) {
        const maxSpeed = options.stepper.getMaxSpeed();
        this.speed = maxSpeed > options.speed! ? options.speed! : maxSpeed;
        this.status = Move.Status.Moving;
        this.stepper = options.stepper;
        this.sensors = options.sensors;
    }

    public getStatus = () => {
        return this.status;
    };

    public getSensorsReadings = () => {
        return this.sensors.reduce<boolean>((reading, sensor) => {
            return sensor.getReading() || reading;
        }, false);
    };

    public abstract loop: () => void;
}

export namespace Move {
    export type Options = {
        speed?: number;
        stepper: Stepper;
        sensors: [Sensor, Sensor];
    };

    export enum Status {
        Moving = "moving",
        Completed = "completed",
        SensorStopped = "sensor-stopped",
    }
}
