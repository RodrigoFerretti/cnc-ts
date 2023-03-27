import NanoTimer from "nanotimer";
import { Gpio } from "onoff";

export class Stepper {
    private pulse: Stepper.Pulse;
    private maxSpeed: number;
    private pulsePin: Gpio;
    private nanoTimer: NanoTimer;
    private enablePin: Gpio;
    private isStepping: boolean;
    private directionPin: Gpio;
    private currentPosition: number;
    private remainingPulses: number;

    constructor(options: Stepper.Options) {
        this.pulse = Stepper.Pulse.Off;
        this.maxSpeed = options.maxSpeed;
        this.pulsePin = options.pulsePin;
        this.nanoTimer = new NanoTimer();
        this.isStepping = false;
        this.enablePin = options.enablePin;
        this.directionPin = options.directionPin;
        this.currentPosition = 0;
        this.remainingPulses = 0;

        this.enablePin.writeSync(Stepper.Enable.Off);
    }

    public move = (options: Stepper.MoveOptions) => {
        const distance = options.position - this.currentPosition;
        const steps = Math.abs(distance);
        const pulses = steps * 2;
        const direction = distance > 0 ? Stepper.Direction.Forwards : Stepper.Direction.Backwards;
        const pulseDelay = (steps / options.speed / pulses) * 1e6;
        const positionIncrement = direction === Stepper.Direction.Forwards ? 1 : -1;

        if (distance === 0 || pulseDelay > 1e6) {
            return;
        }

        this.enablePin.writeSync(Stepper.Enable.On);
        this.directionPin.writeSync(direction);

        this.pulse = Stepper.Pulse.On;
        this.isStepping = true;
        this.remainingPulses = pulses;

        return new Promise<void>(async (resolve) => {
            this.nanoTimer.clearInterval();
            this.nanoTimer.setInterval(
                async () => {
                    if (this.remainingPulses === 0) {
                        return resolve(this.stop());
                    }

                    this.pulsePin.writeSync(this.pulse);
                    this.changePulse();

                    this.remainingPulses--;
                    this.currentPosition =
                        this.pulse === Stepper.Pulse.On
                            ? this.currentPosition + positionIncrement
                            : this.currentPosition;
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
        this.nanoTimer.clearInterval();
        this.enablePin.writeSync(Stepper.Enable.Off);
        this.isStepping = false;
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

    private changePulse = () => {
        this.pulse = this.pulse === Stepper.Pulse.On ? Stepper.Pulse.Off : Stepper.Pulse.On;
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
