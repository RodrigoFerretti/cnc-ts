import { Vector } from "./vector";

export class Arc {
    public readonly angle: number;
    public readonly radius: number;
    public readonly perimeter: number;
    public readonly resolution: number;
    public readonly isClockWise: boolean;
    public readonly finalPosition: Vector<2>;
    public readonly totalPositions: number;
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

        const firstPosition = new Vector<2>(
            this.resolution,
            Math.sqrt(this.resolution * (2 * this.radius - this.resolution)),
        );

        const firstPositionAngle = Vector.angle({
            v1: new Vector<2>(0, 0),
            v2: firstPosition,
            center: new Vector<2>(this.radius, 0),
            isClockWise: true,
        });

        this.totalPositions = Math.abs(Math.floor(this.angle / firstPositionAngle));

        this.angleResolution = this.angle / this.totalPositions;
    }

    public getPosition = (positionIndex: number) => {
        const segmentCos = Math.cos(positionIndex * this.angleResolution);
        const segmentSin = Math.sin(positionIndex * this.angleResolution);

        const centerToInitialPosition = Vector.subtract(this.initialPosition, this.centerPosition);

        const position = new Vector<2>(
            this.centerPosition.x + (centerToInitialPosition.x * segmentCos - centerToInitialPosition.y * segmentSin),
            this.centerPosition.y + (centerToInitialPosition.x * segmentSin + centerToInitialPosition.y * segmentCos),
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
