import { Arc } from "./arc";

export class Stepper {
    public linearMove = (options: Stepper.LinearMoveOptions) => {
        options;
    };

    public arcMove = (options: Stepper.ArcMoveOptions) => {
        options;
    };

    public getPosition = (): number => {
        return 0;
    };
}

export namespace Stepper {
    export type LinearMoveOptions = { position: number; speed?: number };
    export type ArcMoveOptions = { arc: Arc; axis: 0 | 1 };
}
