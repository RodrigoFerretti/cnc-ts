import { RequestHandler } from "express";
import { Config } from "./config";
import { GCode } from "./gcode";
import { Service } from "./service";

export class Controller {
    private config: Config;
    private service: Service;
    private serviceHandlers: Record<GCode.Command, Service.Handler>;

    constructor(options: Controller.Options) {
        this.config = options.config;
        this.service = options.service;
        this.serviceHandlers = {
            [GCode.Command.G00]: this.service.linearMove,
            [GCode.Command.G01]: this.service.linearMove,
            [GCode.Command.G02]: this.service.arcMove,
            [GCode.Command.G03]: this.service.arcMove,
            [GCode.Command.G28]: this.service.home,
            [GCode.Command.M00]: this.service.pause,
            [GCode.Command.M99]: this.service.resume,
        };
    }

    public handleSocketMessage = (message: string): string => {
        const gCode = GCode.parse(message);
        if (gCode === null) return "invalid command";

        this.serviceHandlers[gCode.command](gCode);

        return this.service.status;
    };

    public getConfig: RequestHandler = (_req, res) => res.json(this.config.data);

    public putConfig: RequestHandler = (req, res) => {
        const validationResult = Config.dataSchema.safeParse(req.body);
        if (validationResult.success === false) {
            return res.status(400).json({ message: "Validation error", errors: validationResult.error.issues });
        }

        this.config.data = validationResult.data;

        return res.json(this.config.data);
    };
}

export namespace Controller {
    export type Options = {
        config: Config;
        service: Service;
    };
}
