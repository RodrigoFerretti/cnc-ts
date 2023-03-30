import { Arc } from "./arc";
import { Coordinate } from "./coodinate";
import { Move } from "./move";
import { Sensor } from "./sensor";
import { Stepper } from "./stepper";

export class ArcMove extends Move {
    private arc: Arc;
    private coordinate: Coordinate.X | Coordinate.Y;
    private currentPointIndex: number;
    private timeBetweenPoints: number;

    public constructor(options: ArcMove.Options) {
        super(options);

        this.arc = options.arc;
        this.coordinate = options.coordinate;
        this.currentPointIndex = 0;
        this.timeBetweenPoints = this.arc.perimeter / this.speed / this.arc.pointsLength;

        this.homeSensor.on(Sensor.Event.Trigger, this.break);
        this.limitSensor.on(Sensor.Event.Trigger, this.break);
        this.nanoTimer.setInterval(this.moveToNextPoint, "", `${this.timeBetweenPoints * 1e6}u`);
    }

    private moveToNextPoint = () => {
        if (this.currentPointIndex === this.arc.pointsLength + 1) return this.finish();

        const pointPosition = this.arc.getPointPosition({ index: this.currentPointIndex });
        const position = Math.round(pointPosition[this.coordinate]);
        const speed = Math.abs(position - this.stepper.position) / this.timeBetweenPoints;

        this.stepper.move({ position, speed });
        this.currentPointIndex++;
    };
}

export namespace ArcMove {
    export type Options = {
        arc: Arc;
        speed: number;
        stepper: Stepper;
        coordinate: Coordinate.X | Coordinate.Y;
        homeSensor: Sensor;
        limitSensor: Sensor;
    };
}
