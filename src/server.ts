import { WebSocketServer } from "ws";
import { Router } from "./router";

export class Server extends WebSocketServer {
    constructor(private router: Router) {
        super({ port: 8080 });

        this.on("connection", (webSocket) => {
            webSocket.send("connected", {}, this.handleError);

            webSocket.on("message", (data) => {
                const message = data.toString();
                const result = this.router.handleMessage(message);
                result;
            });
        });
    }

    private handleError = (_error: Error | undefined) => {};
}
