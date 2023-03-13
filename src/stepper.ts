export class Stepper {
    private position: number;

    constructor(options: Stepper.Options) {
        this.position = 0;
        options;
    }

    public linearMove = (options: Stepper.LinearMoveOptions) => {
        options;
    };

    public getPosition = () => {
        return this.position;
    };

    public setPosition = (options: Stepper.SetPositionOptions) => {
        options;
    };

    public distanceToGo = (): number => {
        return 0;
    };

    public step = () => {};
}

export namespace Stepper {
    export type Options = {};
    export type LinearMoveOptions = { position: number; speed?: number };
    export type SetPositionOptions = { position: number };
}
