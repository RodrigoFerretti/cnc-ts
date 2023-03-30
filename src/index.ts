import { Broker } from "./broker";
import { Controller } from "./controller";
import { Router } from "./router";
import { Sensor } from "./sensor";
import { Server } from "./server";
import { Service } from "./service";
import { Stepper } from "./stepper";

const gpioMock = { writeSync: (..._args: any[]) => undefined, readSync: (..._args: any[]) => 0 } as never;

const stepperX = new Stepper({ directionPin: gpioMock, enablePin: gpioMock, pulsePin: gpioMock });
const stepperY = new Stepper({ directionPin: gpioMock, enablePin: gpioMock, pulsePin: gpioMock });
const stepperZ = new Stepper({ directionPin: gpioMock, enablePin: gpioMock, pulsePin: gpioMock });

const sensorXA = new Sensor({ pin: gpioMock, debounceTime: 20 });
const sensorXB = new Sensor({ pin: gpioMock, debounceTime: 20 });
const sensorYA = new Sensor({ pin: gpioMock, debounceTime: 20 });
const sensorYB = new Sensor({ pin: gpioMock, debounceTime: 20 });
const sensorZA = new Sensor({ pin: gpioMock, debounceTime: 20 });
const sensorZB = new Sensor({ pin: gpioMock, debounceTime: 20 });

const broker = new Broker();

const sensors: Service.Sensors = {
    x: { home: sensorXA, limit: sensorXB },
    y: { home: sensorYA, limit: sensorYB },
    z: { home: sensorZA, limit: sensorZB },
};

const steppers: Service.Steppers = { x: stepperX, y: stepperY, z: stepperZ };

const service = new Service({ broker, sensors, steppers });

const controller = new Controller({ service });

const router = new Router({ controller });

const server = new Server({ router, broker });

server;
