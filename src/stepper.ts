import { Gpio } from "onoff";
import { EventEmitter } from "stream";
import { setTimeout } from "timers/promises";

export class Stepper {
    private maxSpeed: number;
    private pulsePin: Gpio;
    private _isMoving: boolean;
    private enablePin: Gpio;
    private directionPin: Gpio;
    private eventEmitter: EventEmitter;
    private currentPosition: number;

    constructor(options: Stepper.Options) {
        this.maxSpeed = options.maxSpeed;
        this.pulsePin = options.pulsePin;
        this._isMoving = false;
        this.enablePin = options.enablePin;
        this.directionPin = options.directionPin;
        this.eventEmitter = new EventEmitter();
        this.currentPosition = 0;

        this.enablePin.writeSync(Stepper.Enable.Off);
    }

    public move = (options: Stepper.MoveOptions) => {
        const targetPosition = options.position;
        const distance = targetPosition - this.currentPosition;
        const speed = options.speed;
        const time = distance / speed;
        const direction = distance > 0 ? Stepper.Direction.Forwards : Stepper.Direction.Backwards;
        const pulseDelay = Math.abs(time / (distance * 2));
        const positionIncrement = distance > 0 ? 1 : -1;

        this._isMoving = true;

        return new Promise<void>(async (resolve) => {
            this.eventEmitter.on("stop", () => {
                this._isMoving = false;
                resolve();
            });

            await this.enablePin.write(Stepper.Enable.On);
            await this.directionPin.write(direction);

            const startTime = performance.now();
            let adjustedPulseDelay = pulseDelay;

            for (let i = 0; i < Math.abs(distance); i++) {
                this.pulsePin.writeSync(Stepper.Pulse.On);
                await setTimeout(adjustedPulseDelay);
                this.pulsePin.writeSync(Stepper.Pulse.Off);
                await setTimeout(adjustedPulseDelay);

                this.currentPosition = this.currentPosition + positionIncrement;

                const difference = performance.now() - startTime - 2 * pulseDelay * (i + 1);
                adjustedPulseDelay = adjustedPulseDelay - difference / 2;
            }

            await this.enablePin.write(Stepper.Enable.On);

            this._isMoving = false;
            resolve();
        });
    };

    public getPosition = () => {
        return this.currentPosition;
    };

    public stop = () => {
        this.eventEmitter.emit("stop");
    };

    public setPosition = (options: Stepper.SetPositionOptions) => {
        this.currentPosition = options.position;
    };

    public getMaxSpeed = () => {
        return this.maxSpeed;
    };

    public isMoving = (): boolean => {
        return this._isMoving;
    };
}

export namespace Stepper {
    export enum Pulse {
        On = 1,
        Off = 0,
    }

    export enum Enable {
        On,
        Off,
    }

    export enum Direction {
        Forwards,
        Backwards,
    }

    export type Options = {
        maxSpeed: number;
        pulsePin: Gpio;
        enablePin: Gpio;
        directionPin: Gpio;
    };

    export type MoveOptions = {
        speed: number;
        position: number;
    };

    export type SetPositionOptions = {
        position: number;
    };
}
