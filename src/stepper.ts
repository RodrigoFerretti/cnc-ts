import { Gpio } from "onoff";
import { EventEmitter } from "stream";
import { setTimeout } from "timers/promises";

export class Stepper {
    private dirPin: Gpio;
    private pulPin: Gpio;
    private enaPin: Gpio;
    private moving: boolean;
    private maxSpeed: number;
    private eventEmitter: EventEmitter;
    private currentPosition: number;

    constructor(options: Stepper.Options) {
        this.dirPin = new Gpio(options.dirPin, "out");
        this.pulPin = new Gpio(options.pulPin, "out");
        this.enaPin = new Gpio(options.enaPin, "out");
        this.moving = false;
        this.maxSpeed = options.maxSpeed;
        this.eventEmitter = new EventEmitter();
        this.currentPosition = 0;

        this.enaPin.writeSync(1);
    }

    public linearMove = (options: Stepper.LinearMoveOptions) => {
        this.moving = true;

        return new Promise<void>(async (resolve) => {
            this.eventEmitter.on("stop", resolve);

            const delay = 1 / (options.speed || this.maxSpeed);
            const targetPosition = options.position;
            const distance = targetPosition - this.currentPosition;

            await this.enaPin.write(0);
            await this.dirPin.write(distance > 0 ? 0 : 1);

            for (let i = 0; i < Math.abs(distance); i++) {
                await this.pulPin.write(1);
                await setTimeout(delay);

                await this.pulPin.write(0);
                await setTimeout(delay);

                this.currentPosition = this.currentPosition + (distance > 0 ? 1 : -1);
            }

            await this.enaPin.write(1);

            this.moving = false;
            resolve();
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

    public isMoving = (): boolean => {
        return this.moving;
    };
}

export namespace Stepper {
    export type Options = {
        dirPin: number;
        pulPin: number;
        enaPin: number;
        maxSpeed: number;
    };

    export type LinearMoveOptions = {
        position: number;
        speed?: number;
    };

    export type SetPositionOptions = {
        position: number;
    };
}
