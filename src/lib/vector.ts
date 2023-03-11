type Tuple<T, N extends number> = N extends N ? (number extends N ? T[] : { length: N } & _TupleOf<T, N, []>) : never;

type _TupleOf<T, N extends number, R extends unknown[]> = R["length"] extends N ? R : _TupleOf<T, N, [T, ...R]>;

export type Vector<N extends number> = Omit<Tuple<number, N>, keyof any[]> & {
    length: N;
};
