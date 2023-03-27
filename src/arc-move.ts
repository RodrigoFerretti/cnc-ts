import { EventEmitter } from "stream";
import { Arc } from "./arc";
import { Coordinate } from "./coodinate";
import { Move } from "./move";
import { Sensor } from "./sensor";
import { Stepper } from "./stepper";

export class ArcMove extends Move {
    private arc: Arc;
    private pointTime: number;
    private coordinate: Coordinate.Abscissa | Coordinate.Ordinate;
    private eventEmitter: EventEmitter;
    private currentPointIndex: number;

    public constructor(options: ArcMove.Options) {
        super({ stepper: options.stepper, sensors: options.sensors, speed: options.speed });

        this.arc = options.arc;
        this.coordinate = options.coordinate;
        this.eventEmitter = new EventEmitter();
        this.currentPointIndex = 0;

        this.sensors[0].on("hit", this.onSensorHit);
        this.sensors[1].on("hit", this.onSensorHit);
        this.eventEmitter.on("final-position", this.onFinalPosition);

        this.pointTime = this.arc.getLength() / this.speed / this.arc.getPointsLength();
        this.nanoTimer.setInterval(this.loop, "", `${this.pointTime * 1e6}u`);
    }

    private onSensorHit = () => {
        this.status = Move.Status.SensorStopped;
        this.stepper.stop();
        this.nanoTimer.clearInterval();
    };

    private onFinalPosition = () => {
        this.status = Move.Status.Completed;
        this.nanoTimer.clearInterval();
    };

    private loop = () => {
        const pointPosition = this.arc.getPointPosition({ index: this.currentPointIndex });
        const position = Math.round(pointPosition[this.coordinate]);
        const distance = position - this.stepper.getPosition();
        const speed = Math.abs(distance) / this.pointTime;

        this.stepper.move({ position: position, speed });
        this.currentPointIndex++;

        if (this.currentPointIndex === this.arc.getPointsLength() + 1) {
            this.eventEmitter.emit("final-position");
        }
    };
}

export namespace ArcMove {
    export type Options = {
        arc: Arc;
        speed: number;
        stepper: Stepper;
        sensors: [Sensor, Sensor];
        coordinate: Coordinate.Abscissa | Coordinate.Ordinate;
    };
}
