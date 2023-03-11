import { Router } from "./router";
import { Sensor } from "./sensor";
import { Server } from "./server";
import { Service } from "./service";
import { Stepper } from "./stepper";

const stepperX = new Stepper();
const stepperY = new Stepper();
const stepperZ = new Stepper();

const sensorXA = new Sensor();
const sensorXB = new Sensor();
const sensorYA = new Sensor();
const sensorYB = new Sensor();
const sensorZA = new Sensor();
const sensorZB = new Sensor();

const service = new Service({
    steppers: [stepperX, stepperY, stepperZ],
    sensors: [sensorXA, sensorXB, sensorYA, sensorYB, sensorZA, sensorZB],
});

const router = new Router({ service });

const server = new Server({ router });

server;
