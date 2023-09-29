import { RequestHandler } from "express";
import { WebsocketRequestHandler } from "express-ws";
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

    public gCodeWebSocketHandler: WebsocketRequestHandler = (webSocket) => {
        webSocket.on("message", (data) => {
            webSocket.send("Command Received");

            const gCode = GCode.parse(data.toString());
            if (gCode === null) return webSocket.send("Invalid Command");

            this.service.gcode[gCode.command](gCode);
        });
    };

    public getConfigRequestHandler: RequestHandler = (_req, res) => {
        return res.json(this.config.data);
    };

    public putConfigRequestHandler: RequestHandler = (req, res) => {
        const validationResult = Config.dataSchema.safeParse(req.body);
        if (validationResult.success === false) {
            return res.status(400).json({ message: "Invalid Request Body", errors: validationResult.error.issues });
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
