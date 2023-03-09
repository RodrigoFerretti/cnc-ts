export class Stepper {
    public moveTo = (options: Stepper.MoveToOptions) => {
        options;
    };
}

export namespace Stepper {
    export type MoveToOptions = { position: number; feedRate?: number };
}
