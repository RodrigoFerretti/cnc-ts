import { Vector } from "./vector";

export class Arc {
    public pointsLength: number;

    private speed: number;
    private angle: number;
    private radius: number;
    private segmentAngle: number;
    private initialPosition: Vector<2>;
    private centerPosition: Vector<2>;

    public constructor(options: Arc.Options) {
        const initialPosition = options.initialPosition;
        const centerPosition = options.centerPosition;
        const finalPosition = options.finalPosition;
        const arcTolerance = options.arcTolerance || 0.01;
        const isClockWise = options.isClockWise;
        const speed = options.speed;

        this.initialPosition = initialPosition;
        this.centerPosition = centerPosition;
        this.speed = speed;

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

    public getPoint = (index: number): Arc.Point => {
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

        const pointSpeed: Vector<2> = [Math.abs(segmentSin) * this.speed, Math.abs(segmentCos) * this.speed];

        return {
            position: pointPosition,
            speed: pointSpeed,
        };
    };
}

export namespace Arc {
    export type Options = {
        initialPosition: Vector<2>;
        centerPosition: Vector<2>;
        finalPosition: Vector<2>;
        arcTolerance?: number;
        isClockWise: boolean;
        speed: number;
    };

    export type Point = {
        position: Vector<2>;
        speed: Vector<2>;
    };
}
