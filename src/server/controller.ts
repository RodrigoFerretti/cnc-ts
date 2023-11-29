import { WebsocketRequestHandler } from "express-ws";
import { GCode } from "./gcode";
import { Service } from "./service";

export class Controller {
    constructor(private service: Service) {}

    public gCodeWebSocketHandler: WebsocketRequestHandler = (webSocket) => {
        webSocket.on("message", (data) => {
            webSocket.send("Command Received");

            const gCode = GCode.parse(data.toString());
            if (gCode === null) {
                return webSocket.send("Invalid Command");
            }

            this.service.gcode[gCode.command](gCode);
        });
    };
}

export namespace Controller {
    export type Options = {
        service: Service;
    };
}
