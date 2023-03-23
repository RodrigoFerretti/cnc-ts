import { Broker } from "./broker";
import { Controller } from "./controller";
import { I2C } from "./i2c";
import { Router } from "./router";
import { Sensor } from "./sensor";
import { Server } from "./server";
import { Service } from "./service";
import { Stepper } from "./stepper";

const gpioMock = { write: async (..._args: any[]) => {}, writeSync: (..._args: any[]) => {} } as never;

const stepperX = new Stepper({ dirPin: gpioMock, enaPin: gpioMock, pulPin: gpioMock, maxSpeed: 1000 });
const stepperY = new Stepper({ dirPin: gpioMock, enaPin: gpioMock, pulPin: gpioMock, maxSpeed: 1000 });
const stepperZ = new Stepper({ dirPin: gpioMock, enaPin: gpioMock, pulPin: gpioMock, maxSpeed: 1000 });

const i2cBusMock = { readWordSync: (..._args: any[]) => 0 } as never;

const i2c = new I2C({ address: 0, bus: i2cBusMock });

const sensorXA = new Sensor({ i2c, port: 0 });
const sensorXB = new Sensor({ i2c, port: 1 });
const sensorYA = new Sensor({ i2c, port: 2 });
const sensorYB = new Sensor({ i2c, port: 3 });
const sensorZA = new Sensor({ i2c, port: 4 });
const sensorZB = new Sensor({ i2c, port: 5 });

const broker = new Broker();

const service = new Service({
    i2c,
    broker,
    sensors: [sensorXA, sensorXB, sensorYA, sensorYB, sensorZA, sensorZB],
    steppers: [stepperX, stepperY, stepperZ],
});

const controller = new Controller({ service });

const router = new Router({ controller });

const server = new Server({ router, broker });

server;
