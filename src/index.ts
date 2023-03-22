import { Router } from "./router";
import { Sensor } from "./sensor";
import { Server } from "./server";
import { Controller } from "./controller";
import { Stepper } from "./stepper";
import { Service } from "./service";
import { I2C } from "./i2c";

const stepperX = new Stepper();
const stepperY = new Stepper();
const stepperZ = new Stepper();

const i2c = new I2C({ address: 0, busNumber: 1 });

const sensorXA = new Sensor({ i2c, port: 0 });
const sensorXB = new Sensor({ i2c, port: 1 });
const sensorYA = new Sensor({ i2c, port: 2 });
const sensorYB = new Sensor({ i2c, port: 3 });
const sensorZA = new Sensor({ i2c, port: 4 });
const sensorZB = new Sensor({ i2c, port: 5 });

const service = new Service({
    i2c,
    sensors: [sensorXA, sensorXB, sensorYA, sensorYB, sensorZA, sensorZB],
    steppers: [stepperX, stepperY, stepperZ],
});

const controller = new Controller({ service });

const router = new Router({ controller });

const server = new Server({ router });

server;
