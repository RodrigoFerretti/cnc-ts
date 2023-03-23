import { Gpio } from "onoff";
import { EventEmitter } from "stream";
import { setTimeout } from "timers/promises";

export class Stepper {
    private moving: boolean;
    private maxSpeed: number;
    private pulsePin: Gpio;
    private enablePin: Gpio;
    private directionPin: Gpio;
    private eventEmitter: EventEmitter;
    private currentPosition: number;

    constructor(options: Stepper.Options) {
        this.moving = false;
        this.maxSpeed = options.maxSpeed;
        this.pulsePin = options.pulsePin;
        this.enablePin = options.enablePin;
        this.directionPin = options.directionPin;
        this.eventEmitter = new EventEmitter();
        this.currentPosition = 0;

        this.enablePin.writeSync(1);
    }

    public linearMove = (options: Stepper.LinearMoveOptions) => {
        const targetPosition = options.position;
        const distance = targetPosition - this.currentPosition;
        const speed = options.speed;
        const time = distance / speed;
        const toAdd = distance > 0 ? 1 : -1;
        const direction = distance > 0 ? 0 : 1;
        const pulseDelay = Math.abs(time / (distance * 2));

        this.moving = true;

        return new Promise<void>(async (resolve) => {
            this.eventEmitter.on("stop", resolve);

            await this.enablePin.write(0);
            await this.directionPin.write(direction);

            const startTime = performance.now();
            let adjustedPulseDelay = pulseDelay;

            for (let i = 0; i < Math.abs(distance); i++) {
                this.pulsePin.writeSync(1);
                await setTimeout(adjustedPulseDelay);
                this.pulsePin.writeSync(0);
                await setTimeout(adjustedPulseDelay);

                this.currentPosition = this.currentPosition + toAdd;

                const difference = performance.now() - startTime - 2 * pulseDelay * (i + 1);

                adjustedPulseDelay = adjustedPulseDelay - difference / 2;
            }

            await this.enablePin.write(1);

            this.moving = false;
            return resolve();
        });
    };

    public getPosition = () => {
        return this.currentPosition;
    };

    public stop = () => {
        this.moving = false;
        this.eventEmitter.emit("stop");
    };

    public setPosition = (options: Stepper.SetPositionOptions) => {
        this.currentPosition = options.position;
    };

    public getMaxSpeed = () => {
        return this.maxSpeed;
    };

    public isMoving = (): boolean => {
        return this.moving;
    };
}

export namespace Stepper {
    export type Options = {
        maxSpeed: number;
        pulsePin: Gpio;
        enablePin: Gpio;
        directionPin: Gpio;
    };

    export type LinearMoveOptions = {
        speed: number;
        position: number;
    };

    export type SetPositionOptions = {
        position: number;
    };
}
