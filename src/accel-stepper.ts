import { Gpio } from "onoff";

export class AccelStepper {
    private _pin: Gpio;
    private _currentPos: number;
    private _targetPos: number;
    private _speed: number;
    private _maxSpeed: number;
    private _acceleration: number;
    private _stepInterval: number;
    private _lastStepTime: number;
    private _n: number;
    private _c0: number;
    private _cn: number;
    private _cmin: number;
    private _direction: number;

    constructor(pul: number) {
        this._currentPos = 0;
        this._targetPos = 0;
        this._speed = 0.0;
        this._maxSpeed = 0.0;
        this._acceleration = 0.0;
        this._lastStepTime = 0;
        this._pin = new Gpio(pul, "out");
        this._n = 0;
        this._c0 = 0.0;
        this._cn = 0.0;
        this._cmin = 1.0;
        this._direction = AccelStepper.DIRECTION_CCW;
        this._stepInterval = 0;

        this.setAcceleration(1);
        this.setMaxSpeed(1);
    }

    public moveTo(absolute: number): void {
        if (this._targetPos !== absolute) {
            this._targetPos = absolute;
            this.computeNewSpeed();
        }
    }

    public move(relative: number): void {
        this.moveTo(this._currentPos + relative);
    }

    public runSpeed(): boolean {
        if (!this._stepInterval) {
            return false;
        }

        const time = Date.now();
        if (time - this._lastStepTime >= this._stepInterval) {
            if (this._direction === AccelStepper.DIRECTION_CW) {
                this._currentPos += 1;
            } else {
                this._currentPos -= 1;
            }
            this.step(this._currentPos);
            this._lastStepTime = time;
            return true;
        } else {
            return false;
        }
    }

    public distanceToGo(): number {
        return this._targetPos - this._currentPos;
    }

    public targetPosition(): number {
        return this._targetPos;
    }

    public currentPosition(): number {
        return this._currentPos;
    }

    public setCurrentPosition(position: number): void {
        this._targetPos = this._currentPos = position;
        this._n = 0;
        this._stepInterval = 0;
        this._speed = 0.0;
    }

    public setMaxSpeed(speed: number): void {
        if (speed < 0.0) {
            speed = -speed;
        }
        if (this._maxSpeed !== speed) {
            this._maxSpeed = speed;
            this._cmin = 1000000.0 / speed;
            if (this._n > 0) {
                this._n = Math.floor((this._speed * this._speed) / (2.0 * this._acceleration));
                this.computeNewSpeed();
            }
        }
    }

    public maxSpeed(): number {
        return this._maxSpeed;
    }

    public setAcceleration(acceleration: number): void {
        if (acceleration === 0.0) {
            return;
        }
        if (acceleration < 0.0) {
            acceleration = -acceleration;
        }
        if (this._acceleration !== acceleration) {
            this._n = Math.floor(this._n * (this._acceleration / acceleration));
            this._c0 = 0.676 * Math.sqrt(2.0 / acceleration) * 1000000.0;
            this._acceleration = acceleration;
            this.computeNewSpeed();
        }
    }

    public acceleration(): number {
        return this._acceleration;
    }

    public setSpeed(speed: number): void {
        if (speed === this._speed) {
            return;
        }
        speed = Math.min(Math.max(speed, -this._maxSpeed), this._maxSpeed);
        if (speed === 0.0) {
            this._stepInterval = 0;
        } else {
            this._stepInterval = Math.abs(1000000.0 / speed);
            this._direction = speed > 0.0 ? AccelStepper.DIRECTION_CW : AccelStepper.DIRECTION_CCW;
        }
        this._speed = speed;
    }

    public speed(): number {
        return this._speed;
    }

    public step(step: number): void {
        switch (step & 0x1) {
            case 0:
                this._pin.writeSync(0);
                break;
            case 1:
                this._pin.writeSync(1);
                break;
        }
    }

    public runSpeedToPosition(): boolean {
        if (this._targetPos === this._currentPos) {
            return false;
        }
        if (this._targetPos > this._currentPos) {
            this._direction = AccelStepper.DIRECTION_CW;
        } else {
            this._direction = AccelStepper.DIRECTION_CCW;
        }
        return this.runSpeed();
    }

    public run(): boolean {
        if (this.runSpeed()) {
            this.computeNewSpeed();
        }
        return this._speed !== 0.0 || this.distanceToGo() !== 0;
    }

    public stop(): void {
        if (this._speed !== 0.0) {
            const stepsToStop = Math.floor((this._speed * this._speed) / (2.0 * this._acceleration)) + 1;
            if (this._speed > 0) {
                this.move(stepsToStop);
            } else {
                this.move(-stepsToStop);
            }
        }
    }

    public isRunning(): boolean {
        return !(this._speed === 0.0 && this._targetPos === this._currentPos);
    }

    private computeNewSpeed(): number {
        const distanceTo = this.distanceToGo();
        const stepsToStop = Math.floor((this._speed * this._speed) / (2.0 * this._acceleration));

        if (distanceTo === 0 && stepsToStop <= 1) {
            this._stepInterval = 0;
            this._speed = 0.0;
            this._n = 0;
            return this._stepInterval;
        }

        if (distanceTo > 0) {
            if (this._n > 0) {
                if (stepsToStop >= distanceTo || this._direction === AccelStepper.DIRECTION_CCW) {
                    this._n = -stepsToStop;
                }
            } else if (this._n < 0) {
                if (stepsToStop < distanceTo && this._direction === AccelStepper.DIRECTION_CW) {
                    this._n = -this._n;
                }
            }
        } else if (distanceTo < 0) {
            if (this._n > 0) {
                if (stepsToStop >= -distanceTo || this._direction === AccelStepper.DIRECTION_CW) {
                    this._n = -stepsToStop;
                }
            } else if (this._n < 0) {
                if (stepsToStop < -distanceTo && this._direction === AccelStepper.DIRECTION_CCW) {
                    this._n = -this._n;
                }
            }
        }

        if (this._n === 0) {
            this._cn = this._c0;
            this._direction = distanceTo > 0 ? AccelStepper.DIRECTION_CW : AccelStepper.DIRECTION_CCW;
        } else {
            this._cn = this._cn - (2.0 * this._cn) / (4.0 * this._n + 1);
            this._cn = Math.max(this._cn, this._cmin);
        }

        this._n++;
        this._stepInterval = this._cn;
        this._speed = 1000000.0 / this._cn;
        if (this._direction === AccelStepper.DIRECTION_CCW) {
            this._speed = -this._speed;
        }
        return this._stepInterval;
    }
}

export namespace AccelStepper {
    export const DIRECTION_CCW = 0;
    export const DIRECTION_CW = 1;
}
