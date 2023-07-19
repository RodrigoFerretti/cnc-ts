import { RequestHandler } from "express";
import { z } from "zod";
import { Config } from "./config";
import { GCode } from "./gcode";
import { Service } from "./service";

export class Controller {
    private config: Config;
    private service: Service;

    constructor(options: Controller.Options) {
        this.config = options.config;
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

        this.service.linearMove(gCode);

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

        this.service.pause();

        return this.service.getStatus();
    };

    public resume: Controller.Handler<GCode.Resume> = () => {
        const serviceStatus = this.service.getStatus();
        if (serviceStatus !== Service.Status.Paused) return "can only resume when paused";

        this.service.resume();

        return this.service.getStatus();
    };

    public getConfig: RequestHandler = (_req, res) => res.json(this.config.data);

    public putConfig: RequestHandler = (req, res) => {
        const validationResult = Config.dataSchema.safeParse(req.body);
        if (validationResult.success === false) {
            return res.status(400).json({ message: "Validation error", errors: validationResult.error.issues });
        }

        this.config.data = { ...this.config.data, ...validationResult.data };

        return res.json(this.config.data);
    };
}

export namespace Controller {
    export type Options = {
        config: Config;
        service: Service;
    };

    export type ResError = {
        message: string;
        errors: z.ZodIssue[];
    };

    export type Handler<G extends GCode = any> = (gCode: G) => string;
}
