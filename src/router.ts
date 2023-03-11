import { GCode } from "./gcode";
import { matchGroups } from "./lib/regex";
import { Service } from "./service";

export class Router {
    private regex: RegExp;
    private routes: Router.Route[];

    public constructor(options: Router.Options) {
        const service = options.service;

        this.regex =
            /^G(?<g>\d*\.?\d*)?|M(?<m>\d*\.?\d*)?|X(?<x>\d*\.?\d*)?|Y(?<y>\d*\.?\d*)?|Z(?<z>\d*\.?\d*)?|I(?<i>\d*\.?\d*)?|J(?<j>\d*\.?\d*)?|K(?<k>\d*\.?\d*)?|R(?<r>\d*\.?\d*)?|F(?<f>\d*\.?\d*)?$/gm;

        this.routes = [
            { command: "G00", handle: service.rapidMove },
            { command: "G01", handle: service.linearMove },
            { command: "G02", handle: service.arcMove },
            { command: "G03", handle: service.arcMove },
            { command: "G28", handle: service.home },
            { command: "M00", handle: service.pause },
            { command: "M99", handle: service.resume },
        ];
    }

    public handleMessage = (message: string): string => {
        const matches = matchGroups(this.regex, message);

        const [gCode, error] = GCode.validate(matches);
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
        service: Service;
    };

    export type Route = {
        command: string;
        handle: Service.Handler;
    };
}
