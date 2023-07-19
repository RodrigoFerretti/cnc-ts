import express, { Express } from "express";
import expressws, { Instance, WebsocketRequestHandler } from "express-ws";
import { Broker } from "./broker";
import { Router } from "./router";

export class Server {
    private app: Express;
    private wss: Instance;
    private router: Router;
    private broker: Broker;

    public constructor(options: Server.Options) {
        this.app = express();
        this.wss = expressws(this.app);
        this.router = options.router;
        this.broker = options.broker;

        this.app.use(express.json());
        this.app.use("/config", this.router.configRouter);
        this.wss.app.ws("/", this.webSocketHandler);
    }

    private webSocketHandler: WebsocketRequestHandler = (webSocket) => {
        webSocket.send("connected");

        webSocket.on("message", (data) => {
            const reqMessage = data.toString();
            const resMessage = this.router.controller.handleSocketMessage(reqMessage);

            webSocket.send(resMessage);
        });

        this.broker.on(Broker.Event.SocketMessage, (message) => {
            webSocket.send(message);
        });
    };

    public start = (port: number = 8080) => {
        this.app.listen(port, () => console.log(`Server running on port ${port}`));
    };
}

export namespace Server {
    export type Options = {
        router: Router;
        broker: Broker;
    };
}
