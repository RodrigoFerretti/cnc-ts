import express from "express";
import expressws from "express-ws";
import { Controller } from "./controller";

export class Server {
    private app = express();
    private wss = expressws(this.app);

    public constructor(private controller: Controller) {
        this.app.use(express.json());
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
