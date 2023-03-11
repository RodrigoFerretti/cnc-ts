import { Router } from "./router";
import { Server } from "./server";
import { Service } from "./service";
import { Stepper } from "./stepper";
import { Switch } from "./switch";

const stepperX = new Stepper();
const stepperY = new Stepper();
const stepperZ = new Stepper();

const switchXA = new Switch();
const switchXB = new Switch();
const switchYA = new Switch();
const switchYB = new Switch();
const switchZA = new Switch();
const switchZB = new Switch();

const service = new Service(
    [stepperX, stepperY, stepperZ],
    [switchXA, switchXB, switchYA, switchYB, switchZA, switchZB]
);

const router = new Router(service);

const server = new Server(router);

server;
