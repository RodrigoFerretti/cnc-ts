import { Service } from "./service";
import { Vector } from "./vector";

export class Controller {
    constructor(private service: Service) {}

    public home: ControllerFn = (message) => {
        message;

        this.service.home();
    };

    public rapidMove: ControllerFn = (message) => {
        message;

        const position: Vector = [0, 0, 0];

        this.service.rapidMove({ position });
    };

    public linearMove: ControllerFn = (message) => {
        message;

        const position: Vector = [0, 0, 0];
        const feedRate = 0;

        this.service.linearMove({ position, feedRate });
    };

    public arcMove: ControllerFn = (message) => {
        message;

        const position: Vector = [0, 0, 0];
        const centerOffset: Vector = [0, 0, 0];
        const feedRate = 0;

        this.service.arcMove({ position, centerOffset, feedRate });
    };

    public pause: ControllerFn = (message) => {
        message;

        this.service.pause();
    };

    public resume: ControllerFn = (message) => {
        message;

        this.service.resume();
    };
}

export type ControllerFn = (message: string) => void;
