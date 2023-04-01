import { Broker } from "./broker";
import { Controller } from "./controller";
import { Coordinate } from "./coodinate";
import { Router } from "./router";
import { Sensor } from "./sensor";
import { Server } from "./server";
import { Service } from "./service";
import { Stepper } from "./stepper";

const gpioMock = { writeSync: (..._args: any[]) => undefined, readSync: (..._args: any[]) => 0 } as never;

const stepperX = new Stepper({ directionPin: gpioMock, enablePin: gpioMock, pulsePin: gpioMock });
const stepperY0 = new Stepper({ directionPin: gpioMock, enablePin: gpioMock, pulsePin: gpioMock });
const stepperY1 = new Stepper({ directionPin: gpioMock, enablePin: gpioMock, pulsePin: gpioMock });
const stepperZ = new Stepper({ directionPin: gpioMock, enablePin: gpioMock, pulsePin: gpioMock });

const sensorXA = new Sensor({ pin: gpioMock, debounceTime: 20 });
const sensorXB = new Sensor({ pin: gpioMock, debounceTime: 20 });
const sensorY0A = new Sensor({ pin: gpioMock, debounceTime: 20 });
const sensorY0B = new Sensor({ pin: gpioMock, debounceTime: 20 });
const sensorY1A = new Sensor({ pin: gpioMock, debounceTime: 20 });
const sensorY1B = new Sensor({ pin: gpioMock, debounceTime: 20 });
const sensorZA = new Sensor({ pin: gpioMock, debounceTime: 20 });
const sensorZB = new Sensor({ pin: gpioMock, debounceTime: 20 });

const broker = new Broker();

const xAxis: Service.Axis = { stepper: stepperX, homeSensor: sensorXA, limitSensor: sensorXB };
const y0Axis: Service.Axis = { stepper: stepperY0, homeSensor: sensorY0A, limitSensor: sensorY0B };
const y1Axis: Service.Axis = { stepper: stepperY1, homeSensor: sensorY1A, limitSensor: sensorY1B };
const zAxis: Service.Axis = { stepper: stepperZ, homeSensor: sensorZA, limitSensor: sensorZB };

const slaveAxis: Service.SlaveAxis = { coordinate: Coordinate.Y, ...y1Axis };

const service = new Service({ broker, axes: { x: xAxis, y: y0Axis, z: zAxis, slave: slaveAxis } });

const controller = new Controller({ service });

const router = new Router({ controller });

const server = new Server({ router, broker });

server;
