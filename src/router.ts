import { GCode } from "./gcode";
import { matchGroups } from "./regex";
import { Controller } from "./controller";

export class Router {
    private regex: RegExp;
    private routes: Router.Route[];
    private controller: Controller;

    public constructor(options: Router.Options) {
        this.regex =
            /^G(?<g>\d*\.?\d*)?|M(?<m>\d*\.?\d*)?|X(?<x>\d*\.?\d*)?|Y(?<y>\d*\.?\d*)?|Z(?<z>\d*\.?\d*)?|I(?<i>\d*\.?\d*)?|J(?<j>\d*\.?\d*)?|K(?<k>\d*\.?\d*)?|R(?<r>\d*\.?\d*)?|F(?<f>\d*\.?\d*)?$/gm;

        this.controller = options.controller;

        this.routes = [
            { command: "G00", handle: this.controller.rapidMove },
            { command: "G01", handle: this.controller.linearMove },
            { command: "G02", handle: this.controller.arcMove },
            { command: "G03", handle: this.controller.arcMove },
            { command: "G28", handle: this.controller.home },
            { command: "M00", handle: this.controller.pause },
            { command: "M99", handle: this.controller.resume },
        ];
    }

    public handleMessage = (message: string): string => {
        const matches = matchGroups({ regex: this.regex, message });

        const [gCode, error] = GCode.validate({ input: matches });
        if (error !== null) {
            return "invalid command";
        }

        const route = this.routes.find((route) => route.command === ("g" in gCode ? `G${gCode.g}` : `M${gCode.m}`));
        if (route === undefined) {
            return "not found";
        }

        return route.handle(gCode);
    };
}

export namespace Router {
    export type Options = {
        controller: Controller;
    };

    export type Route = {
        command: string;
        handle: Controller.Handler;
    };
}
