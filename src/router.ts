import { Controller, ControllerFn } from "./controller";

export class Router {
    private routes: Route[];

    public constructor(private controller: Controller) {
        this.routes = [
            { messagePrefix: "G00", handle: this.controller.rapidMove },
            { messagePrefix: "G01", handle: this.controller.linearMove },
            { messagePrefix: "G02", handle: this.controller.arcMove },
            { messagePrefix: "G03", handle: this.controller.arcMove },
            { messagePrefix: "G99", handle: this.controller.home },
            { messagePrefix: "M00", handle: this.controller.pause },
            { messagePrefix: "M01", handle: this.controller.resume },
        ];
    }

    public handleMessage = (message: string) => {
        const route = this.routes.find((route) => message.startsWith(route.messagePrefix));
        if (route === undefined) return;

        route.handle(message);
    };
}

export type Route = { messagePrefix: string; handle: ControllerFn };
