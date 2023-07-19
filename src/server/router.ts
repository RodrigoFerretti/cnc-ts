import express from "express";
import { Controller } from "./controller";
import { GCode } from "./gcode";

export class Router {
    public config: express.Router;

    private controller: Controller;
    private commandHandler: Router.CommandHandler;

    public constructor(options: Router.Options) {
        this.controller = options.controller;

        this.commandHandler = {
            [GCode.Command.G00]: this.controller.rapidMove,
            [GCode.Command.G01]: this.controller.linearMove,
            [GCode.Command.G02]: this.controller.arcMove,
            [GCode.Command.G03]: this.controller.arcMove,
            [GCode.Command.G28]: this.controller.home,
            [GCode.Command.M00]: this.controller.pause,
            [GCode.Command.M99]: this.controller.resume,
        };

        this.config = express.Router();

        this.config.get("/", this.controller.getConfig);
        this.config.put("/", this.controller.putConfig);
    }

    public handleMessage = (message: string): string => {
        const gCode = GCode.parse(message);
        if (gCode === null) return "invalid command";

        const handle = this.commandHandler[gCode.command];

        return handle(gCode);
    };
}

export namespace Router {
    export type Options = {
        controller: Controller;
    };

    export type CommandHandler = Record<GCode.Command, Controller.Handler>;
}
