import { Move } from "./move";
import { Arc } from "./arc";
import { Coordinate } from "./coodinate";
import { Sensor } from "./sensor";
import { Stepper } from "./stepper";

export class ArcMove extends Move {
    private arc: Arc;
    private coordinate: Coordinate.Abscissa | Coordinate.Ordinate;
    private currentPointIndex: number;

    public constructor(options: ArcMove.Options) {
        super({ stepper: options.stepper, sensors: options.sensors, speed: options.speed });

        this.arc = options.arc;
        this.coordinate = options.coordinate;
        this.currentPointIndex = 0;
    }

    public loop = () => {
        if (this.getSensorsReadings()) {
            this.stepper.stop();
            this.status = Move.Status.SensorStopped;
            return;
        }

        if (this.status !== Move.Status.Moving) {
            return;
        }

        if (this.stepper.isMoving()) {
            return;
        }

        if (this.currentPointIndex === this.arc.getPointsLenght() + 1) {
            this.status = Move.Status.Completed;
            return;
        }

        const point = this.arc.getPoint({ index: this.currentPointIndex, speed: this.speed });
        this.stepper.move({ position: point.position[this.coordinate], speed: point.speed[this.coordinate] });
        this.currentPointIndex++;
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
