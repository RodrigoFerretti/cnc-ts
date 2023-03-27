import { WebSocketServer } from "ws";
import { Broker } from "./broker";
import { Router } from "./router";

export class Server extends WebSocketServer {
    public constructor(options: Server.Options) {
        const router = options.router;
        const broker = options.broker;

        super({ port: 8080 }, () => console.log("Websocket server running on port 8080"));

        this.on("connection", (webSocket) => {
            webSocket.send("connected");

            webSocket.on("message", (data) => {
                const requestMessage = data.toString();
                const responseMessage = router.handleMessage(requestMessage);

                webSocket.send(responseMessage);
            });
        });

        broker.on("message", (message) => {
            this.clients.forEach((webSocket) => {
                webSocket.send(message);
            });
        });
    }
}

export namespace Server {
    export type Options = {
        router: Router;
        broker: Broker;
    };
}
