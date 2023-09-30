import { Arc } from "../math/arc";
import { Coordinate } from "../math/coodinate";
import { Move } from "./move";
import { Sensor } from "../io/sensor";
import { Stepper } from "../io/stepper";

export class ArcMove extends Move {
    private arc: Arc;
    private coordinate: Coordinate.X | Coordinate.Y;
    private currentPosition: number;
    private timeBetweenPositions: number;

    public constructor(options: ArcMove.Options) {
        super(options);

        this.arc = options.arc;
        this.coordinate = options.coordinate;
        this.currentPosition = 0;
        this.timeBetweenPositions = this.arc.perimeter / this.speed / this.arc.totalPositions;

        this.homeSensor.on(Sensor.Event.Trigger, this.break);
        this.limitSensor.on(Sensor.Event.Trigger, this.break);

        this.nanoTimer.setInterval(this.moveToNextPosition, "", `${this.timeBetweenPositions * 1e6}u`);
    }

    private moveToNextPosition = () => {
        if (this.currentPosition === this.arc.totalPositions + 1) {
            return this.finish();
        }

        const position = this.arc.getPosition(this.currentPosition);
        const coordinatePosition = Math.round(position[this.coordinate]);
        const speed = Math.abs(coordinatePosition - this.stepper.position) / this.timeBetweenPositions;

        this.stepper.move({ position: coordinatePosition, speed });
        this.currentPosition++;
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
