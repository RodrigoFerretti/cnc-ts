import NanoTimer from "nanotimer";
import { Gpio } from "onoff";
import { EventEmitter } from "stream";

export class Stepper {
    private pulse: Stepper.Pulse;
    private pulsePin: Gpio;
    private nanoTimer: NanoTimer;
    private enablePin: Gpio;
    private eventEmitter: EventEmitter;
    private directionPin: Gpio;
    private currentPosition: number;
    private remainingPulses: number;

    constructor(options: Stepper.Options) {
        this.pulse = Stepper.Pulse.Off;
        this.pulsePin = options.pulsePin;
        this.nanoTimer = new NanoTimer();
        this.enablePin = options.enablePin;
        this.eventEmitter = new EventEmitter();
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

        if (distance === 0) {
            this.emit("move-completed");
            return;
        }

        this.enablePin.writeSync(Stepper.Enable.On);
        this.directionPin.writeSync(direction);

        this.pulse = Stepper.Pulse.On;
        this.remainingPulses = pulses;

        return new Promise<void>(async (resolve) => {
            this.nanoTimer.clearInterval();
            this.nanoTimer.setInterval(
                async () => {
                    if (this.remainingPulses === 0) {
                        this.emit("move-completed");
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
    };

    public setPosition = (options: Stepper.SetPositionOptions) => {
        this.currentPosition = options.position;
    };

    private changePulse = () => {
        this.pulse = this.pulse === Stepper.Pulse.On ? Stepper.Pulse.Off : Stepper.Pulse.On;
    };

    public on = (eventName: "move-completed", listener: () => void) => {
        this.eventEmitter.on(eventName, listener);
    };

    private emit = (eventName: "move-completed") => {
        this.eventEmitter.emit(eventName);
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
