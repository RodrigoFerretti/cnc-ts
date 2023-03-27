import { Broker } from "./broker";
import { Controller } from "./controller";
import { I2C } from "./i2c";
import { Router } from "./router";
import { Sensor } from "./sensor";
import { Server } from "./server";
import { Service } from "./service";
import { Stepper } from "./stepper";

const gpioMock = { writeSync: (..._args: any[]) => {} } as never;

const stepperX = new Stepper({ directionPin: gpioMock, enablePin: gpioMock, pulsePin: gpioMock });
const stepperY = new Stepper({ directionPin: gpioMock, enablePin: gpioMock, pulsePin: gpioMock });
const stepperZ = new Stepper({ directionPin: gpioMock, enablePin: gpioMock, pulsePin: gpioMock });

const i2CBusMock = { readWordSync: (..._args: any[]) => 0 } as never;

const i2C = new I2C({ address: 0, bus: i2CBusMock });

const sensorXA = new Sensor({ i2C, port: 0 });
const sensorXB = new Sensor({ i2C, port: 1 });
const sensorYA = new Sensor({ i2C, port: 2 });
const sensorYB = new Sensor({ i2C, port: 3 });
const sensorZA = new Sensor({ i2C, port: 4 });
const sensorZB = new Sensor({ i2C, port: 5 });

const broker = new Broker();

const service = new Service({
    broker,
    sensors: [sensorXA, sensorXB, sensorYA, sensorYB, sensorZA, sensorZB],
    steppers: [stepperX, stepperY, stepperZ],
});

const controller = new Controller({ service });

const router = new Router({ controller });

const server = new Server({ router, broker });

server;
