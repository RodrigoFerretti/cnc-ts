export type Vector<N extends number> = N extends 2
    ? [number, number]
    : N extends 3
    ? [number, number, number]
    : number[];
