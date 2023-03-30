import { Vector } from "./vector";

export class Arc {
    private angle: number;
    private radius: number;
    private tolerance: number;
    private isClockWise: boolean;
    private segmentAngle: number;
    private finalPosition: Vector<2>;
    private centerPosition: Vector<2>;
    private initialPosition: Vector<2>;

    public readonly perimeter: number;
    public readonly pointsLength: number;

    public constructor(options: Arc.Options) {
        this.tolerance = options.tolerance;
        this.isClockWise = options.isClockWise;
        this.finalPosition = options.finalPosition;
        this.centerPosition = options.centerPosition;
        this.initialPosition = options.initialPosition;

        this.radius = Math.sqrt(
            Math.pow(this.initialPosition.x - this.centerPosition.x, 2) +
                Math.pow(this.initialPosition.y - this.centerPosition.y, 2)
        );

        this.angle = Math.atan2(
            (this.initialPosition.x - this.centerPosition.x) * (this.finalPosition.y - this.centerPosition.y) -
                (this.initialPosition.y - this.centerPosition.y) * (this.finalPosition.x - this.centerPosition.x),
            (this.initialPosition.x - this.centerPosition.x) * (this.finalPosition.x - this.centerPosition.x) +
                (this.initialPosition.y - this.centerPosition.y) * (this.finalPosition.y - this.centerPosition.y)
        );

        this.angle = this.isClockWise && this.angle >= 0 ? this.angle - 2 * Math.PI : this.angle;
        this.angle = !this.isClockWise && this.angle <= 0 ? this.angle + 2 * Math.PI : this.angle;

        this.perimeter = Math.abs(this.radius * this.angle);

        this.pointsLength = Math.floor(
            Math.abs(0.5 * this.perimeter) / Math.sqrt(this.tolerance * (2 * this.radius - this.tolerance))
        );

        this.segmentAngle = this.angle / this.pointsLength;
    }

    public getPointPosition = (options: Arc.GetPointPositionOptions) => {
        const index = options.index;

        const segmentCos = Math.cos(index * this.segmentAngle);
        const segmentSin = Math.sin(index * this.segmentAngle);

        const position = new Vector<2>(
            this.centerPosition.x +
                ((this.initialPosition.x - this.centerPosition.x) * segmentCos -
                    (this.initialPosition.y - this.centerPosition.y) * segmentSin),
            this.centerPosition.y +
                ((this.initialPosition.x - this.centerPosition.x) * segmentSin +
                    (this.initialPosition.y - this.centerPosition.y) * segmentCos)
        );

        return position;
    };
}

export namespace Arc {
    export type Options = {
        tolerance: number;
        isClockWise: boolean;
        finalPosition: Vector<2>;
        centerPosition: Vector<2>;
        initialPosition: Vector<2>;
    };

    export type GetPointPositionOptions = {
        index: number;
    };
}
