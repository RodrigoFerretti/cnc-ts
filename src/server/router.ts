import express from "express";
import { Controller } from "./controller";

export class Router {
    public controller: Controller;
    public configRouter: express.Router;

    public constructor(options: Router.Options) {
        this.controller = options.controller;
        this.configRouter = express.Router();
        this.configRouter.get("/", this.controller.getConfig);
        this.configRouter.put("/", this.controller.putConfig);
    }
}

export namespace Router {
    export type Options = {
        controller: Controller;
    };
}
