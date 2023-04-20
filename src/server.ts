import express, { Express } from "express";
import expressws, { Instance } from "express-ws";
import { Broker } from "./broker";
import { Router } from "./router";

export class Server {
    private app: Express;
    private wss: Instance;

    public constructor(options: Server.Options) {
        const router = options.router;
        const broker = options.broker;

        this.app = express();
        this.wss = expressws(this.app);

        this.app.use(express.json());

        this.wss.app.ws("/", (webSocket) => {
            webSocket.send("connected");

            webSocket.on("message", (data) => {
                const requestMessage = data.toString();
                const responseMessage = router.handleMessage(requestMessage);

                webSocket.send(responseMessage);
            });

            broker.on("message", (message) => {
                webSocket.send(message);
            });
        });
    }

    public start = (port: number) => {
        this.app.listen(8080, () => console.log("Server running on port 8080"));
    };
}

export namespace Server {
    export type Options = {
        router: Router;
        broker: Broker;
    };
}
