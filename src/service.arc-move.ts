import { Arc } from "./lib/arc";
import { Vector } from "./lib/vector";
import { Stepper } from "./stepper";

export class ArcMoveService {
    private arc: Arc;
    private speed: number;
    private indexes: [number, number];
    private maxSpeed: number;
    private steppers: [Stepper, Stepper, Stepper];
    private coordinates: Vector<2>;

    public constructor(options: ArcMoveService.Options) {
        this.arc = options.arc;
        this.indexes = [0, 0];
        this.steppers = options.steppers;
        this.coordinates = options.coordinates;

        this.maxSpeed = 200;
        this.speed = this.maxSpeed > options.speed! ? options.speed! : this.maxSpeed;
    }

    public loop = () => {
        this.coordinates.reduce<void>((_, coordinate, i) => {
            if (this.steppers[coordinate].distanceToGo() !== 0) return;
            const point = this.arc.getPoint({ index: this.indexes[i], speed: this.speed });
            this.steppers[coordinate].linearMove({ position: point.position[i], speed: point.speed![i] });
            this.indexes[i]++;
        }, undefined);
    };
}

export namespace ArcMoveService {
    export type Options = {
        arc: Arc;
        speed?: number;
        steppers: [Stepper, Stepper, Stepper];
        coordinates: Vector<2>;
    };
}
