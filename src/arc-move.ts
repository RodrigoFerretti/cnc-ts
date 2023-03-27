import { Arc } from "./arc";
import { Coordinate } from "./coodinate";
import { Move } from "./move";
import { Sensor } from "./sensor";
import { Stepper } from "./stepper";

export class ArcMove extends Move {
    private arc: Arc;
    private pointTime: number;
    private coordinate: Coordinate.Abscissa | Coordinate.Ordinate;
    private currentPointIndex: number;

    public constructor(options: ArcMove.Options) {
        super({ stepper: options.stepper, sensors: options.sensors, speed: options.speed });

        this.arc = options.arc;
        this.coordinate = options.coordinate;
        this.currentPointIndex = 0;

        const time = this.arc.getLength() / this.speed;
        const pointsLength = this.arc.getPointsLength();

        this.pointTime = time / pointsLength;
        this.nanoTimer.setInterval(this.loop, "", `${this.pointTime * 1e6}u`);
    }

    protected loop = () => {
        if (this.getSensorsReadings()) {
            this.status = Move.Status.SensorStopped;
            this.nanoTimer.clearInterval();
            this.stepper.stop();
            return;
        }

        if (this.currentPointIndex === this.arc.getPointsLength() + 1) {
            this.status = Move.Status.Completed;
            this.nanoTimer.clearInterval();
            return;
        }

        const pointPosition = this.arc.getPointPosition({ index: this.currentPointIndex });
        const coordinatePosition = Math.round(pointPosition[this.coordinate]);
        const distance = coordinatePosition - this.stepper.getPosition();
        const speed = Math.abs(distance) / this.pointTime;

        this.stepper.move({ position: coordinatePosition, speed });
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
