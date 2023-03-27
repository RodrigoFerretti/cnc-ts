import { Vector } from "./vector";

export class Arc {
    private angle: number;
    private radius: number;
    private tolerance: number;
    private isClockWise: boolean;
    private pointsLength: number;
    private segmentAngle: number;
    private finalPosition: Vector<2>;
    private centerPosition: Vector<2>;
    private initialPosition: Vector<2>;

    public constructor(options: Arc.Options) {
        this.tolerance = options.tolerance;
        this.isClockWise = options.isClockWise;
        this.finalPosition = options.finalPosition;
        this.centerPosition = options.centerPosition;
        this.initialPosition = options.initialPosition;

        this.radius = Math.sqrt(
            Math.pow(this.initialPosition[0] - this.centerPosition[0], 2) +
                Math.pow(this.initialPosition[1] - this.centerPosition[1], 2)
        );

        this.angle = Math.atan2(
            (this.initialPosition[0] - this.centerPosition[0]) * (this.finalPosition[1] - this.centerPosition[1]) -
                (this.initialPosition[1] - this.centerPosition[1]) * (this.finalPosition[0] - this.centerPosition[0]),
            (this.initialPosition[0] - this.centerPosition[0]) * (this.finalPosition[0] - this.centerPosition[0]) +
                (this.initialPosition[1] - this.centerPosition[1]) * (this.finalPosition[1] - this.centerPosition[1])
        );

        this.angle = this.isClockWise && this.angle >= 0 ? this.angle - 2 * Math.PI : this.angle;
        this.angle = !this.isClockWise && this.angle <= 0 ? this.angle + 2 * Math.PI : this.angle;

        this.pointsLength = Math.floor(
            Math.abs(0.5 * this.angle * this.radius) / Math.sqrt(this.tolerance * (2 * this.radius - this.tolerance))
        );

        this.segmentAngle = this.angle / this.pointsLength;
    }

    public getPointsLength = () => {
        return this.pointsLength;
    };

    public getPointPosition = (options: Arc.GetPointPositionOptions) => {
        const index = options.index;

        const segmentCos = Math.cos(index * this.segmentAngle);
        const segmentSin = Math.sin(index * this.segmentAngle);

        const position: Vector<2> = [
            this.centerPosition[0] +
                ((this.initialPosition[0] - this.centerPosition[0]) * segmentCos -
                    (this.initialPosition[1] - this.centerPosition[1]) * segmentSin),
            this.centerPosition[1] +
                ((this.initialPosition[0] - this.centerPosition[0]) * segmentSin +
                    (this.initialPosition[1] - this.centerPosition[1]) * segmentCos),
        ];

        return position;
    };

    public getPerimeter = () => {
        return Math.abs(this.radius * this.angle);
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
