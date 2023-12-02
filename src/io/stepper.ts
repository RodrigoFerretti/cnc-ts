import NanoTimer from "nanotimer";
import { Gpio } from "pigpio";
import { EventEmitter } from "stream";

export class Stepper extends EventEmitter {
    private pulse: Stepper.Pulse;
    private enable: Stepper.Enable;
    private maxSpeed: number;
    private pulsePin: Gpio[];
    private inverted: boolean;
    private direction: Stepper.Direction;
    private nanoTimer: NanoTimer;
    private directionPin: Gpio[];
    private currentPosition: number;
    private remainingPulses: number;

    constructor(options: Stepper.Options) {
        super();

        this.pulse = Stepper.Pulse.Off;
        this.enable = Stepper.Enable.Off;
        this.maxSpeed = options.maxSpeed;
        this.pulsePin = options.pulsePin;
        this.inverted = options.inverted || false;
        this.direction = Stepper.Direction.Forwards;
        this.nanoTimer = new NanoTimer();
        this.directionPin = options.directionPin;
        this.currentPosition = 0;
        this.remainingPulses = 0;
    }

    public get position() {
        return this.currentPosition;
    }

    public set position(position: number) {
        this.currentPosition = position;
    }

    public getMaxSpeed = () => this.maxSpeed;

    public move = (options: Stepper.MoveOptions) => {
        const distance = options.position - this.currentPosition;
        const steps = Math.abs(distance);
        const pulses = steps * 2;
        const direction = distance > 0 ? Stepper.Direction.Forwards : Stepper.Direction.Backwards;
        const pulseDelay = 5e5 / options.speed || 1;

        this.nanoTimer.clearInterval();

        this.pulse = Stepper.Pulse.On;
        this.enable = Stepper.Enable.On;
        this.direction = direction;
        this.directionPin.forEach((pin) => pin.digitalWrite(this.inverted ? direction ^ 1 : direction));
        this.remainingPulses = pulses;

        this.emit(Stepper.Event.MoveStart);

        this.nanoTimer.setInterval(this.step, "", `${pulseDelay}u`);
    };

    private step = () => {
        if (this.enable === Stepper.Enable.Off) {
            return;
        }

        if (this.remainingPulses === 0) {
            return this.finish();
        }

        this.pulsePin.forEach((pin) => pin.digitalWrite(this.pulse));
        this.pulse = this.pulse === Stepper.Pulse.On ? Stepper.Pulse.Off : Stepper.Pulse.On;

        this.remainingPulses--;

        if (this.pulse === Stepper.Pulse.Off) {
            return;
        }

        if (this.direction === Stepper.Direction.Forwards) {
            return void this.currentPosition++;
        }

        if (this.direction === Stepper.Direction.Backwards) {
            return void this.currentPosition--;
        }
    };

    private finish = () => {
        this.nanoTimer.clearInterval();
        this.stop();
        this.emit(Stepper.Event.MoveFinish);
    };

    public stop = async () => {
        this.enable = Stepper.Enable.Off;
    };

    public resume = async () => {
        this.enable = Stepper.Enable.On;
    };

    public on = <T extends Stepper.Event>(eventName: T, listener: () => void) => {
        return super.on(eventName, listener);
    };

    public emit = <T extends Stepper.Event>(eventName: T) => {
        return super.emit(eventName);
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
        maxSpeed: number;
        pulsePin: Gpio[];
        directionPin: Gpio[];
        inverted?: boolean;
    };

    export type MoveOptions = {
        speed: number;
        position: number;
    };

    export type SetPositionOptions = {
        position: number;
    };
}
