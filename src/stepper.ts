import NanoTimer from "nanotimer";
import { Gpio } from "onoff";
import { EventEmitter } from "stream";

export class Stepper {
    private pulse: Stepper.Pulse;
    private enable: Stepper.Enable;
    private pulsePin: Gpio;
    private direction: Stepper.Direction;
    private nanoTimer: NanoTimer;
    private enablePin: Gpio;
    private eventEmitter: EventEmitter;
    private directionPin: Gpio;
    private currentPosition: number;
    private remainingPulses: number;

    constructor(options: Stepper.Options) {
        this.pulse = Stepper.Pulse.Off;
        this.enable = Stepper.Enable.Off;
        this.pulsePin = options.pulsePin;
        this.direction = Stepper.Direction.Forwards;
        this.nanoTimer = new NanoTimer();
        this.enablePin = options.enablePin;
        this.eventEmitter = new EventEmitter();
        this.directionPin = options.directionPin;
        this.currentPosition = 0;
        this.remainingPulses = 0;

        this.enablePin.writeSync(this.enable);
    }

    public get position() {
        return this.currentPosition;
    }

    public set position(position: number) {
        this.currentPosition = position;
    }

    public move = (options: Stepper.MoveOptions) => {
        const distance = options.position - this.currentPosition;
        const steps = Math.abs(distance);
        const pulses = steps * 2;
        const direction = distance > 0 ? Stepper.Direction.Forwards : Stepper.Direction.Backwards;
        const pulseDelay = (steps / options.speed / pulses) * 1e6 || 1;

        this.nanoTimer.clearInterval();

        this.pulse = Stepper.Pulse.On;
        this.enable = Stepper.Enable.On;
        this.direction = direction;
        this.enablePin.writeSync(this.enable);
        this.directionPin.writeSync(direction);
        this.remainingPulses = pulses;

        this.emit(Stepper.Event.MoveStart);
        this.nanoTimer.setInterval(this.step, "", `${pulseDelay}u`);
    };

    private step = () => {
        if (this.enable === Stepper.Enable.Off) return;
        if (this.remainingPulses === 0) return this.finish();

        this.pulsePin.writeSync(this.pulse);
        this.pulse = this.pulse === Stepper.Pulse.On ? Stepper.Pulse.Off : Stepper.Pulse.On;

        this.remainingPulses--;
        this.currentPosition =
            this.pulse === Stepper.Pulse.On
                ? this.currentPosition + (this.direction === Stepper.Direction.Forwards ? 1 : -1)
                : this.currentPosition;
    };

    private finish = () => {
        this.nanoTimer.clearInterval();
        this.stop();
        this.emit(Stepper.Event.MoveFinish);
    };

    public stop = async () => {
        this.enable = Stepper.Enable.Off;
        this.enablePin.writeSync(this.enable);
    };

    public resume = async () => {
        this.enable = Stepper.Enable.On;
        this.enablePin.writeSync(this.enable);
    };

    public on = <T extends Stepper.Event>(eventName: T, listener: () => void) => {
        this.eventEmitter.on(eventName, listener);
    };

    private emit = <T extends Stepper.Event>(eventName: T) => {
        this.eventEmitter.emit(eventName);
    };
}

export namespace Stepper {
    export enum Event {
        MoveStart = "moveStart",
        MoveFinish = "moveFinish",
    }

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
