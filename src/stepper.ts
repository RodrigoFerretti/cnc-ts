import NanoTimer from "nanotimer";
import { Gpio } from "onoff";

export class Stepper {
    private maxSpeed: number;
    private pulsePin: Gpio;
    private nanoTimer: NanoTimer;
    private enablePin: Gpio;
    private isStepping: boolean;
    private directionPin: Gpio;
    private currentPosition: number;

    constructor(options: Stepper.Options) {
        this.maxSpeed = options.maxSpeed;
        this.pulsePin = options.pulsePin;
        this.nanoTimer = new NanoTimer();
        this.isStepping = false;
        this.enablePin = options.enablePin;
        this.directionPin = options.directionPin;
        this.currentPosition = 0;

        this.enablePin.writeSync(Stepper.Enable.Off);
    }

    public move = (options: Stepper.MoveOptions) => {
        const speed = options.speed;
        const targetPosition = Math.round(options.position);
        const distance = targetPosition - this.currentPosition;
        const steps = Math.abs(distance);
        const time = steps / speed;
        const pulses = steps * 2;
        const pulseDelay = (time / pulses) * 1e6;
        const direction = distance > 0 ? Stepper.Direction.Forwards : Stepper.Direction.Backwards;
        const positionIncrement = direction === Stepper.Direction.Forwards ? 1 : -1;

        if (distance === 0) {
            return;
        }

        let pulse: Stepper.Pulse = Stepper.Pulse.On;
        let remainingPulses = pulses;

        this.isStepping = true;

        this.enablePin.writeSync(Stepper.Enable.On);
        this.directionPin.writeSync(direction);

        return new Promise<void>(async (resolve) => {
            this.nanoTimer.setInterval(
                async () => {
                    if (remainingPulses === 0) {
                        return resolve(this.stop());
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
        this.isStepping = false;
        this.nanoTimer.clearInterval();
        this.enablePin.writeSync(Stepper.Enable.Off);
    };

    public setPosition = (options: Stepper.SetPositionOptions) => {
        this.currentPosition = options.position;
    };

    public getMaxSpeed = () => {
        return this.maxSpeed;
    };

    public isMoving = (): boolean => {
        return this.isStepping;
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
