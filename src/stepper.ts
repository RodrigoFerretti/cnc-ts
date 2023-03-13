export class Stepper {
    public linearMove = (options: Stepper.LinearMoveOptions) => {
        options;
    };

    public getPosition = (): number => {
        return 0;
    };

    public setPosition = (options: Stepper.SetPositionOptions) => {
        options;
    };

    public distanceToGo = (): number => {
        return 0;
    };

    public step = (): boolean => {
        return true;
    };
}

export namespace Stepper {
    export type LinearMoveOptions = { position: number; speed?: number };
    export type SetPositionOptions = { position: number };
}
