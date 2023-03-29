import { Arc } from "./arc";
import { Coordinate } from "./coodinate";
import { Move } from "./move";
import { Sensor } from "./sensor";
import { Stepper } from "./stepper";

export class ArcMove extends Move {
    private arc: Arc;
    private coordinate: Coordinate.Abscissa | Coordinate.Ordinate;
    private currentPointIndex: number;
    private timeBetweenPoints: number;

    public constructor(options: ArcMove.Options) {
        super(options);

        this.arc = options.arc;
        this.coordinate = options.coordinate;
        this.currentPointIndex = 0;
        this.timeBetweenPoints = this.arc.getPerimeter() / this.speed / this.arc.getPointsLength();

        this.homeSensor.on("trigger", this.break);
        this.limitSensor.on("trigger", this.break);
        this.nanoTimer.setInterval(this.moveToNextPoint, "", `${this.timeBetweenPoints * 1e6}u`);
    }

    private moveToNextPoint = () => {
        if (this.currentPointIndex === this.arc.getPointsLength() + 1) return this.finish();

        const pointPosition = this.arc.getPointPosition({ index: this.currentPointIndex });
        const position = Math.round(pointPosition[this.coordinate]);
        const speed = Math.abs(position - this.stepper.getPosition()) / this.timeBetweenPoints;

        this.stepper.move({ position, speed });
        this.currentPointIndex++;
    };
}

export namespace ArcMove {
    export type Options = {
        arc: Arc;
        speed: number;
        stepper: Stepper;
        coordinate: Coordinate.Abscissa | Coordinate.Ordinate;
        homeSensor: Sensor;
        limitSensor: Sensor;
    };
}
