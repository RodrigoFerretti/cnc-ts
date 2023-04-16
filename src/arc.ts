import { Vector } from "./vector";

export class Arc {
    public readonly angle: number;
    public readonly radius: number;
    public readonly perimeter: number;
    public readonly resolution: number;
    public readonly isClockWise: boolean;
    public readonly totalPoints: number;
    public readonly finalPosition: Vector<2>;
    public readonly centerPosition: Vector<2>;
    public readonly initialPosition: Vector<2>;
    public readonly angleResolution: number;

    public constructor(options: Arc.Options) {
        this.resolution = options.resolution;
        this.isClockWise = options.isClockWise;
        this.finalPosition = options.finalPosition;
        this.centerPosition = options.centerPosition;
        this.initialPosition = options.initialPosition;

        this.angle = Vector.angle({
            v1: this.initialPosition,
            v2: this.finalPosition,
            center: this.centerPosition,
            isClockWise: this.isClockWise,
        });

        this.radius = Vector.subtract(this.initialPosition, this.centerPosition).magnitude;
        this.perimeter = Math.abs(this.radius * this.angle);

        const resolutionPosition = new Vector<2>(
            this.resolution,
            Math.sqrt(this.resolution * (2 * this.radius - this.resolution))
        );

        const resolutionPositionAngle = Vector.angle({
            v1: new Vector<2>(0, 0),
            v2: resolutionPosition,
            center: new Vector<2>(this.radius, 0),
            isClockWise: true,
        });

        this.totalPoints = Math.abs(Math.floor(this.angle / resolutionPositionAngle));

        this.angleResolution = this.angle / this.totalPoints;
    }

    public getPointPosition = (pointIndex: number) => {
        const segmentCos = Math.cos(pointIndex * this.angleResolution);
        const segmentSin = Math.sin(pointIndex * this.angleResolution);

        const centerToInitialPosition = Vector.subtract(this.initialPosition, this.centerPosition);

        const position = new Vector<2>(
            this.centerPosition.x + (centerToInitialPosition.x * segmentCos - centerToInitialPosition.y * segmentSin),
            this.centerPosition.y + (centerToInitialPosition.x * segmentSin + centerToInitialPosition.y * segmentCos)
        );

        return position;
    };
}

export namespace Arc {
    export type Options = {
        resolution: number;
        isClockWise: boolean;
        finalPosition: Vector<2>;
        centerPosition: Vector<2>;
        initialPosition: Vector<2>;
    };
}
