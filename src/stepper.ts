import NanoTimer from "nanotimer";
import { Gpio } from "onoff";

export class Stepper {
    private maxSpeed: number;
    private pulsePin: Gpio;
    private nanoTimer: NanoTimer;
    private _isMoving: boolean;
    private enablePin: Gpio;
    private directionPin: Gpio;
    private currentPosition: number;

    constructor(options: Stepper.Options) {
        this.maxSpeed = options.maxSpeed;
        this.pulsePin = options.pulsePin;
        this.nanoTimer = new NanoTimer();
        this._isMoving = false;
        this.enablePin = options.enablePin;
        this.directionPin = options.directionPin;
        this.currentPosition = 0;

        this.enablePin.writeSync(Stepper.Enable.Off);
    }

    public move = async (options: Stepper.MoveOptions) => {
        const speed = options.speed;
        const targetPosition = options.position;
        const distance = targetPosition - this.currentPosition;
        const steps = Math.abs(distance);
        const time = steps / speed;
        const pulses = steps * 2;
        const pulseDelay = (time / pulses) * 1e6;
        const direction = distance > 0 ? Stepper.Direction.Forwards : Stepper.Direction.Backwards;
        const positionIncrement = direction === Stepper.Direction.Forwards ? 1 : -1;

        let pulse: Stepper.Pulse = Stepper.Pulse.On;
        let remainingPulses = pulses;

        this._isMoving = true;

        await this.enablePin.write(Stepper.Enable.On);
        await this.directionPin.write(direction);

        return new Promise<void>(async (resolve) => {
            this.nanoTimer.setInterval(
                async () => {
                    if (remainingPulses === 0) {
                        await this.stop();
                        return resolve();
                    }

                    this.pulsePin.writeSync(pulse);
                    pulse = pulse === Stepper.Pulse.On ? Stepper.Pulse.Off : Stepper.Pulse.On;
                    this.currentPosition = this.currentPosition + (pulse === Stepper.Pulse.On ? positionIncrement : 0);
                    remainingPulses--;
                },
                "",
                `${pulseDelay}u`
            );
        });
    };

    public getPosition = () => {
        return this.currentPosition;
    };

    public stop = async () => {
        await this.enablePin.write(Stepper.Enable.Off);
        this._isMoving = false;
        this.nanoTimer.clearInterval();
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
