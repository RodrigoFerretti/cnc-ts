import { WebSocketServer } from "ws";
import { Router } from "./router";

export class Server extends WebSocketServer {
    constructor(private router: Router) {
        super({ port: 8080 }, () => console.log("websocket server running on port 8080"));

        this.on("connection", (webSocket) => {
            webSocket.send("connected", {}, this.handleError);

            webSocket.on("message", (data) => {
                const requestMessage = data.toString();
                const responseMessage = this.router.handleMessage(requestMessage);

                webSocket.send(responseMessage);
            });
        });
    }

    private handleError = (_error: Error | undefined) => {};
}
