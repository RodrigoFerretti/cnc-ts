import { GCode } from "./gcode";
import { Arc } from "./lib/arc";
import { Vector } from "./lib/vector";
import { Sensor } from "./sensor";
import { ArcMoveService } from "./service.arc-move";
import { HomeService } from "./service.home";
import { Stepper } from "./stepper";

export class Service {
    private status: Service.Status;
    private sensors: [Sensor, Sensor, Sensor, Sensor, Sensor, Sensor];
    private steppers: [Stepper, Stepper, Stepper];
    private homeService: HomeService | undefined;
    private arcMoveService: ArcMoveService | undefined;

    constructor(options: Service.Options) {
        this.status = Service.Status.Idle;
        this.sensors = options.sensors;
        this.steppers = options.steppers;
    }

    public getStatus = () => {
        return this.status;
    };

    public home = () => {
        this.status = Service.Status.Homing;
        this.homeService = new HomeService({ sensors: this.sensors, steppers: this.steppers });
    };

    public rapidMove = (gCode: GCode.RapidMove) => {
        this.status = Service.Status.RapidMoving;

        const currentPosition: Vector<3> = [
            this.steppers[0].getPosition(),
            this.steppers[1].getPosition(),
            this.steppers[2].getPosition(),
        ];

        const finalPosition: Vector<3> = [
            gCode.x || currentPosition[0],
            gCode.y || currentPosition[1],
            gCode.z || currentPosition[2],
        ];

        this.steppers[0].linearMove({ position: finalPosition[0] });
        this.steppers[1].linearMove({ position: finalPosition[1] });
        this.steppers[2].linearMove({ position: finalPosition[2] });
    };

    public linearMove = (gCode: GCode.LinearMove) => {
        this.status = Service.Status.LinearMoving;

        const currentPosition: Vector<3> = [
            this.steppers[0].getPosition(),
            this.steppers[1].getPosition(),
            this.steppers[2].getPosition(),
        ];

        const finalPosition: Vector<3> = [
            gCode.x || currentPosition[0],
            gCode.y || currentPosition[1],
            gCode.z || currentPosition[2],
        ];

        const speed = gCode.f;

        this.steppers[0].linearMove({ position: finalPosition[0], speed });
        this.steppers[1].linearMove({ position: finalPosition[1], speed });
        this.steppers[2].linearMove({ position: finalPosition[2], speed });
    };

    public arcMove = (gCode: GCode.ArcMove) => {
        this.status = Service.Status.ArcMoving;

        const currentPosition: Vector<3> = [
            this.steppers[0].getPosition(),
            this.steppers[1].getPosition(),
            this.steppers[2].getPosition(),
        ];

        const centerPosition: Vector<3> = [
            currentPosition[0] + (gCode.i || 0),
            currentPosition[1] + (gCode.j || 0),
            currentPosition[2] + (gCode.k || 0),
        ];

        const finalPosition: Vector<3> = [
            gCode.x || currentPosition[0],
            gCode.y || currentPosition[1],
            gCode.z || currentPosition[2],
        ];

        const abscissa = gCode.i !== undefined ? 0 : 1;
        const ordinate = gCode.j !== undefined ? 1 : 2;
        const applicate = gCode.i === undefined ? 0 : gCode.j === undefined ? 1 : 2;

        const arc = new Arc({
            isClockWise: gCode.g === "02",
            finalPosition: [finalPosition[abscissa], finalPosition[ordinate]],
            centerPosition: [centerPosition[abscissa], centerPosition[ordinate]],
            initialPosition: [currentPosition[abscissa], currentPosition[ordinate]],
        });

        this.arcMoveService = new ArcMoveService({
            arc,
            speed: gCode.f,
            steppers: this.steppers,
            coordinates: [abscissa, ordinate],
        });

        const applicateSpeed = 0;

        this.steppers[applicate].linearMove({ position: finalPosition[applicate], speed: applicateSpeed });
    };

    public pause = () => {
        const resumeStatus = this.status;
        this.status = Service.Status.Paused;

        this.resume = () => {
            this.status = resumeStatus;
        };
    };

    public resume = () => {};

    public loop = () => {
        this.sensors.reduce<void>((_, sensor) => {
            sensor.read();
        }, undefined);

        if (this.status === Service.Status.Homing && this.homeService !== undefined) {
            this.homeService.loop();
            const homeServiceStatus = this.homeService.getStatus();
            this.status = homeServiceStatus === HomeService.Status.Completed ? Service.Status.Idle : this.status;
        }

        if (this.status === Service.Status.ArcMoving && this.arcMoveService !== undefined) {
            this.arcMoveService.loop();
            const arcMoveServiceStatus = this.arcMoveService.getStatus();
            this.status = arcMoveServiceStatus === ArcMoveService.Status.Completed ? Service.Status.Idle : this.status;
        }

        if (this.status === Service.Status.LinearMoving || this.status === Service.Status.RapidMoving) {
            const moving = this.steppers.reduce<boolean>((moving, stepper) => {
                return stepper.distanceToGo() === 0 ? false : moving;
            }, true);

            this.status = moving === false ? Service.Status.Idle : this.status;
        }

        this.steppers.reduce<void>((_, stepper) => {
            stepper.step();
        }, undefined);
    };
}

export namespace Service {
    export enum Status {
        Idle = "idle",
        Homing = "homing",
        Paused = "paused",
        ArcMoving = "arc-moving",
        RapidMoving = "rapid-moving",
        LinearMoving = "linear-moving",
    }

    export type Options = {
        sensors: [Sensor, Sensor, Sensor, Sensor, Sensor, Sensor];
        steppers: [Stepper, Stepper, Stepper];
    };
}
