import { Switch } from "./switch";
import { Controller } from "./controller";
import { Router } from "./router";
import { Server } from "./server";
import { Service } from "./service";
import { Stepper } from "./stepper";

const stepperX0 = new Stepper();
const stepperX1 = new Stepper();
const stepperY0 = new Stepper();
const stepperZ0 = new Stepper();

const switchX0A = new Switch();
const switchX0B = new Switch();
const switchX1A = new Switch();
const switchX1B = new Switch();
const switchY0A = new Switch();
const switchY0B = new Switch();
const switchZ0A = new Switch();
const switchZ0B = new Switch();

const service = new Service(
    [stepperX0, stepperX1, stepperY0, stepperZ0],
    [switchX0A, switchX0B, switchX1A, switchX1B, switchY0A, switchY0B, switchZ0A, switchZ0B]
);

const controller = new Controller(service);

const router = new Router(controller);

const server = new Server(router);

server;
