export class Stepper {
    private position: number;

    constructor() {
        this.position = 0;
    }

    public linearMove = (_options: Stepper.LinearMoveOptions) => {};

    public getPosition = () => {
        return this.position;
    };

    public stop = () => {
        this.linearMove({ position: this.getPosition() });
    };

    public setPosition = (_options: Stepper.SetPositionOptions) => {};

    public distanceToGo = (): number => {
        return 0;
    };

    public step = () => {};
}

export namespace Stepper {
    export type LinearMoveOptions = { position: number; speed?: number };
    export type SetPositionOptions = { position: number };
}
