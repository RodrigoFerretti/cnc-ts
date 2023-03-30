export class Vector<N extends 2 | 3> {
    public readonly x: number;
    public readonly y: number;
    public readonly z: N extends 3 ? number : undefined;

    constructor(x: number, y: number);
    constructor(x: number, y: number, z: number);
    constructor(...args: number[]) {
        this.x = args[0];
        this.y = args[1];
        this.z = args[2] as N extends 3 ? number : undefined;
    }

    public get magnitude() {
        return Math.sqrt(this.x ** 2 + this.y ** 2 + (this.z ?? 0) ** 2);
    }

    public subtract(v: Vector<N>) {
        return new Vector<N>(this.x - v.x, this.y - v.y, (this.z ?? 0) - (v.z ?? 0));
    }
}
