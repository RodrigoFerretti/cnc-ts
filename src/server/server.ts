import express, { Express } from "express";
import expressws, { Instance } from "express-ws";
import { Controller } from "./controller";

export class Server {
    private app: Express;
    private wss: Instance;
    private controller: Controller;

    public constructor(options: Server.Options) {
        this.app = express();
        this.wss = expressws(this.app);
        this.controller = options.controller;

        this.app.use(express.json());
        this.app.get("/config", this.controller.getConfigRequestHandler);
        this.app.put("/config", this.controller.putConfigRequestHandler);
        this.wss.app.ws("/gcode", this.controller.gCodeWebSocketHandler);
        this.wss.app.ws("/error", /** TODO */ () => {});
        this.wss.app.ws("/status", /** TODO */ () => {});
        this.wss.app.ws("/position", /** TODO */ () => {});
    }

    public start = (port: number = 8080) => {
        this.app.listen(port, () => console.log(`Server running on port ${port}`));
    };
}

export namespace Server {
    export type Options = {
        controller: Controller;
    };
}
