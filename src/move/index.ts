import { Sensor } from "../sensor";
import { Stepper } from "../stepper";

export abstract class Move {
    protected status: Move.Status;
    protected stepper: Stepper;
    protected sensors: [Sensor, Sensor];

    public constructor(options: Move.Options) {
        this.status = Move.Status.Moving;
        this.stepper = options.stepper;
        this.sensors = options.sensors;
    }

    public getStatus = () => {
        return this.status;
    };

    public getSensorsReading = () => {
        return this.sensors.reduce<boolean>((reading, sensor) => {
            return sensor.getReading() || reading;
        }, false);
    };

    public abstract loop: () => void;
}

export namespace Move {
    export type Options = {
        stepper: Stepper;
        sensors: [Sensor, Sensor];
    };

    export enum Status {
        Moving = "moving",
        Completed = "completed",
        SensorStopped = "sensor-stopped",
    }
}
