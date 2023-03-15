import { Move } from ".";
import { Arc } from "../lib/arc";
import { Coordinate } from "../lib/coodinate";
import { Sensor } from "../sensor";
import { Stepper } from "../stepper";

export class ArcMove extends Move {
    private arc: Arc;
    private speed: number;
    private maxSpeed: number;
    private coordinate: Coordinate.Abscissa | Coordinate.Ordinate;
    private currentPoint: number;

    public constructor(options: ArcMove.Options) {
        super({ stepper: options.stepper, sensors: options.sensors });

        this.arc = options.arc;
        this.maxSpeed = 200;
        this.coordinate = options.coordinate;
        this.currentPoint = 0;

        this.speed = this.maxSpeed > options.speed! ? options.speed! : this.maxSpeed;
    }

    public loop = () => {
        if (this.getSensorsReading()) {
            this.stepper.linearMove({ position: this.stepper.getPosition() });
            this.status = Move.Status.SensorStopped;
            return;
        }

        if (this.status !== Move.Status.Moving) {
            return;
        }

        if (this.currentPoint === this.arc.getPointsLenght()) {
            this.status = Move.Status.Completed;
            return;
        }

        if (this.stepper.distanceToGo() !== 0) {
            return;
        }

        const point = this.arc.getPoint({ index: this.currentPoint, speed: this.speed });
        this.stepper.linearMove({ position: point.position[this.coordinate], speed: point.speed![this.coordinate] });
        this.currentPoint++;
    };
}

export namespace ArcMove {
    export type Options = {
        arc: Arc;
        speed?: number;
        stepper: Stepper;
        sensors: [Sensor, Sensor];
        coordinate: Coordinate.Abscissa | Coordinate.Ordinate;
    };
}
