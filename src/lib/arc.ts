import { Vector } from "./vector";

export class Arc {
    public pointsLength: number;

    private angle: number;
    private radius: number;
    private segmentAngle: number;
    private initialPosition: Vector<2>;
    private centerPosition: Vector<2>;

    public constructor(options: Arc.Options) {
        const isClockWise = options.isClockWise;
        const arcTolerance = options.arcTolerance || 0.01;
        const finalPosition = options.finalPosition;
        const centerPosition = options.centerPosition;
        const initialPosition = options.initialPosition;

        this.initialPosition = initialPosition;
        this.centerPosition = centerPosition;

        this.radius = Math.sqrt(
            Math.pow(this.initialPosition[0] - this.centerPosition[0], 2) +
                Math.pow(this.initialPosition[1] - this.centerPosition[1], 2)
        );

        this.angle = Math.atan2(
            (initialPosition[0] - centerPosition[0]) * (finalPosition[1] - centerPosition[1]) -
                (initialPosition[1] - centerPosition[1]) * (finalPosition[0] - centerPosition[0]),
            (initialPosition[0] - centerPosition[0]) * (finalPosition[0] - centerPosition[0]) +
                (initialPosition[1] - centerPosition[1]) * (finalPosition[1] - centerPosition[1])
        );

        this.angle = isClockWise && this.angle >= 0 ? this.angle - 2 * Math.PI : this.angle;
        this.angle = !isClockWise && this.angle <= 0 ? this.angle + 2 * Math.PI : this.angle;

        this.pointsLength = Math.floor(
            Math.abs(0.5 * this.angle * this.radius) / Math.sqrt(arcTolerance * (2 * this.radius - arcTolerance))
        );

        this.segmentAngle = this.angle / this.pointsLength;
    }

    public getPoint = (options: Arc.GetPointOptions): Arc.Point => {
        const index = options.index;
        const speed = options.speed;

        const segmentCos = Math.cos(index * this.segmentAngle);
        const segmentSin = Math.sin(index * this.segmentAngle);

        const pointPosition: Vector<2> = [
            this.centerPosition[0] +
                ((this.initialPosition[0] - this.centerPosition[0]) * segmentCos -
                    (this.initialPosition[1] - this.centerPosition[1]) * segmentSin),
            this.centerPosition[1] +
                ((this.initialPosition[0] - this.centerPosition[0]) * segmentSin +
                    (this.initialPosition[1] - this.centerPosition[1]) * segmentCos),
        ];

        const pointSpeed: Vector<2> = [Math.abs(segmentSin) * speed, Math.abs(segmentCos) * speed];

        return {
            index,
            speed: pointSpeed,
            position: pointPosition,
        };
    };
}

export namespace Arc {
    export type Options = {
        isClockWise: boolean;
        arcTolerance?: number;
        finalPosition: Vector<2>;
        centerPosition: Vector<2>;
        initialPosition: Vector<2>;
    };

    export type Point = {
        index: number;
        speed: Vector<2>;
        position: Vector<2>;
    };

    export type GetPointOptions = {
        index: number;
        speed: number;
    };
}
