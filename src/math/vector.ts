export class Vector<N extends 2 | 3> {
    public readonly x: number;
    public readonly y: number;
    public readonly z: N extends 3 ? number : undefined;

    constructor(x: number, y: number, z: number | undefined = undefined) {
        this.x = x;
        this.y = y;
        this.z = z as typeof this.z;
    }

    public get magnitude() {
        return Math.sqrt(this.x ** 2 + this.y ** 2 + (this.z || 0) ** 2);
    }
}

export namespace Vector {
    export const add = <N extends 2 | 3>(v1: Vector<N>, v2: Vector<N>) => {
        return new Vector<N>(v1.x + v2.x, v1.y + v2.y, (v1.z || 0) + (v2.z || 0));
    };

    export const subtract = <N extends 2 | 3>(v1: Vector<N>, v2: Vector<N>) => {
        return new Vector<N>(v1.x - v2.x, v1.y - v2.y, (v1.z || 0) - (v2.z || 0));
    };

    export const dotProduct = <N extends 2 | 3>(v1: Vector<N>, v2: Vector<N>) => {
        return v1.x * v2.x + v1.y * v2.y + (v1.z || 0) * (v2.z || 0);
    };

    export const crossProduct = (v1: Vector<2>, v2: Vector<2>) => {
        return v1.x * v2.y - v1.y * v2.x;
    };

    export type AngleOptions = {
        v1: Vector<2>;
        v2: Vector<2>;
        center: Vector<2>;
        isClockWise: boolean;
    };

    export const angle = (options: AngleOptions) => {
        const centerToV1 = Vector.subtract(options.v1, options.center);
        const centerToV2 = Vector.subtract(options.v2, options.center);

        const angle = Math.atan2(
            Vector.crossProduct(centerToV1, centerToV2),
            Vector.dotProduct(centerToV1, centerToV2),
        );

        if (options.isClockWise && angle >= 0) {
            return angle - 2 * Math.PI;
        }

        if (!options.isClockWise && angle <= 0) {
            return angle + 2 * Math.PI;
        }

        return angle;
    };
}
