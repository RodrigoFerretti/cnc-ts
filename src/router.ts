import { Service } from "./service";
import { GCode } from "./gcode";
import { matchGroups } from "./regex";

export class Router {
    private routes: Router.Route[];

    private regex =
        /^G(?<g>\d*\.?\d*)?|M(?<m>\d*\.?\d*)?|X(?<x>\d*\.?\d*)?|Y(?<y>\d*\.?\d*)?|Z(?<z>\d*\.?\d*)?|I(?<i>\d*\.?\d*)?|J(?<j>\d*\.?\d*)?|K(?<k>\d*\.?\d*)?|R(?<r>\d*\.?\d*)?|F(?<f>\d*\.?\d*)?$/gm;

    public constructor(private service: Service) {
        this.routes = [
            { command: "G00", handle: this.service.rapidMove },
            { command: "G01", handle: this.service.linearMove },
            { command: "G02", handle: this.service.arcMove },
            { command: "G03", handle: this.service.arcMove },
            { command: "G28", handle: this.service.home },
            { command: "M00", handle: this.service.pause },
            { command: "M99", handle: this.service.resume },
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
    export type Route = { command: string; handle: Service.Handler };
}
