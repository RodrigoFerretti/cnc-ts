export class Stepper {
    public linearMove = (options: Stepper.LinearMoveOptions) => {
        options;
    };

    public getPosition = (): number => {
        return 0;
    };

    public step = () => {};
}

export namespace Stepper {
    export type LinearMoveOptions = { position: number; speed?: number };
}
