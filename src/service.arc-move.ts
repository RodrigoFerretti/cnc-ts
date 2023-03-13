import { Arc } from "./lib/arc";
import { Vector } from "./lib/vector";
import { Stepper } from "./stepper";

export class ArcMoveService {
    private arc: Arc;
    private speed: number;
    private status: [ArcMoveService.Status, ArcMoveService.Status];
    private indexes: [number, number];
    private maxSpeed: number;
    private steppers: [Stepper, Stepper, Stepper];
    private coordinates: Vector<2>;

    public constructor(options: ArcMoveService.Options) {
        this.arc = options.arc;
        this.status = [ArcMoveService.Status.Moving, ArcMoveService.Status.Moving];
        this.indexes = [0, 0];
        this.steppers = options.steppers;
        this.coordinates = options.coordinates;

        this.maxSpeed = 200;
        this.speed = this.maxSpeed > options.speed! ? options.speed! : this.maxSpeed;
    }

    public getStatus = () => {
        return this.status.reduce((status, currentStatus) => {
            const arcMoveServiceStatus = Object.values(ArcMoveService.Status);
            return arcMoveServiceStatus.indexOf(currentStatus) < arcMoveServiceStatus.indexOf(status)
                ? currentStatus
                : status;
        }, ArcMoveService.Status.Moving);
    };

    public loop = () => {
        this.coordinates.reduce<void>((_, coordinate, i) => {
            if (this.indexes[i] === this.arc.getPointsLenght()) {
                this.status[i] = ArcMoveService.Status.Completed;
                return;
            }

            if (this.steppers[coordinate].distanceToGo() !== 0) {
                return;
            }

            const point = this.arc.getPoint({ index: this.indexes[i], speed: this.speed });
            this.steppers[coordinate].linearMove({ position: point.position[i], speed: point.speed![i] });
            this.indexes[i]++;
        }, undefined);
    };
}

export namespace ArcMoveService {
    export enum Status {
        Moving = "moving",
        Completed = "completed",
    }

    export type Options = {
        arc: Arc;
        speed?: number;
        steppers: [Stepper, Stepper, Stepper];
        coordinates: Vector<2>;
    };
}
