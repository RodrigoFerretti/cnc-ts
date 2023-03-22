import { GCode } from "./gcode";
import { Service } from "./service";

export class Controller {
    private service: Service;

    constructor(options: Controller.Options) {
        this.service = options.service;
    }

    public home: Controller.Handler<GCode.Home> = () => {
        const serviceStatus = this.service.getStatus();
        if (serviceStatus !== Service.Status.Idle) return "can only move when idle";

        this.service.home();

        return this.service.getStatus();
    };

    public rapidMove: Controller.Handler<GCode.RapidMove> = (gCode) => {
        const serviceStatus = this.service.getStatus();
        if (serviceStatus !== Service.Status.Idle) return "can only move when idle";

        this.service.rapidMove(gCode);

        return this.service.getStatus();
    };

    public linearMove: Controller.Handler<GCode.LinearMove> = (gCode) => {
        const serviceStatus = this.service.getStatus();
        if (serviceStatus !== Service.Status.Idle) return "can only move when idle";

        this.service.linearMove(gCode);

        return this.service.getStatus();
    };

    public arcMove: Controller.Handler<GCode.ArcMove> = (gCode) => {
        const serviceStatus = this.service.getStatus();
        if (serviceStatus !== Service.Status.Idle) return "can only move when idle";

        this.service.arcMove(gCode);

        return this.service.getStatus();
    };

    public pause: Controller.Handler<GCode.Pause> = () => {
        const serviceStatus = this.service.getStatus();
        if (!serviceStatus.endsWith("moving")) return "can only pause when moving";

        return this.service.getStatus();
    };

    public resume: Controller.Handler<GCode.Resume> = () => {
        const serviceStatus = this.service.getStatus();
        if (serviceStatus !== Service.Status.Paused) return "can only resume when paused";

        return this.service.getStatus();
    };
}

export namespace Controller {
    export type Options = {
        service: Service;
    };

    export type Handler<G extends GCode = any> = (gCode: G) => string;
}
