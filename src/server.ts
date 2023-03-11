import { WebSocketServer } from "ws";
import { Router } from "./router";

export class Server extends WebSocketServer {
    constructor(options: Server.Options) {
        const router = options.router;

        super({ port: 8080 }, () => console.log("websocket server running on port 8080"));

        this.on("connection", (webSocket) => {
            webSocket.send("connected", {}, this.handleError);

            webSocket.on("message", (data) => {
                const requestMessage = data.toString();
                const responseMessage = router.handleMessage(requestMessage);

                webSocket.send(responseMessage);
            });
        });
    }

    private handleError = (_error: Error | undefined) => {};
}

export namespace Server {
    export type Options = {
        router: Router;
    };
}
