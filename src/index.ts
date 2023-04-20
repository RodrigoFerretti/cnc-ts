import { Broker } from "./broker";
import { Config } from "./config";
import { Controller } from "./controller";
import { Gpio } from "./gpio";
import { Router } from "./router";
import { Sensor } from "./sensor";
import { Server } from "./server";
import { Service } from "./service";
import { Stepper } from "./stepper";

const config = Config.get();

const stepperX = new Stepper({
    directionPin: new Gpio(config.xAxisStepperDirectionPin, "out"),
    enablePin: new Gpio(config.xAxisStepperEnablePin, "out"),
    pulsePin: new Gpio(config.xAxisStepperPulsePin, "out"),
    maxSpeed: config.xAxisStepperMaxSpeed,
});

const stepperY = new Stepper({
    directionPin: new Gpio(config.yAxisStepperDirectionPin, "out"),
    enablePin: new Gpio(config.yAxisStepperEnablePin, "out"),
    pulsePin: new Gpio(config.yAxisStepperPulsePin, "out"),
    maxSpeed: config.yAxisStepperMaxSpeed,
});

const stepperZ = new Stepper({
    directionPin: new Gpio(config.zAxisStepperDirectionPin, "out"),
    enablePin: new Gpio(config.zAxisStepperEnablePin, "out"),
    pulsePin: new Gpio(config.zAxisStepperPulsePin, "out"),
    maxSpeed: config.zAxisStepperMaxSpeed,
});

const homeSensorX = new Sensor({
    pin: new Gpio(config.xAxisHomeSensorPin, "in"),
    debounceTime: config.xAxisHomeSensorDebounceTime,
});

const homeSensorY = new Sensor({
    pin: new Gpio(config.yAxisHomeSensorPin, "in"),
    debounceTime: config.yAxisHomeSensorDebounceTime,
});

const homeSensorZ = new Sensor({
    pin: new Gpio(config.zAxisHomeSensorPin, "in"),
    debounceTime: config.zAxisHomeSensorDebounceTime,
});

const limitSensorX = new Sensor({
    pin: new Gpio(config.xAxisLimitSensorPin, "in"),
    debounceTime: config.xAxisLimitSensorDebounceTime,
});

const limitSensorY = new Sensor({
    pin: new Gpio(config.yAxisLimitSensorPin, "in"),
    debounceTime: config.yAxisLimitSensorDebounceTime,
});

const limitSensorZ = new Sensor({
    pin: new Gpio(config.zAxisLimitSensorPin, "in"),
    debounceTime: config.zAxisLimitSensorDebounceTime,
});

const xAxis: Service.Axis = { stepper: stepperX, homeSensor: homeSensorX, limitSensor: limitSensorX };
const yAxis: Service.Axis = { stepper: stepperY, homeSensor: homeSensorY, limitSensor: limitSensorY };
const zAxis: Service.Axis = { stepper: stepperZ, homeSensor: homeSensorZ, limitSensor: limitSensorZ };

const broker = new Broker();
const service = new Service({ broker, axes: { x: xAxis, y: yAxis, z: zAxis } });
const controller = new Controller({ service });
const router = new Router({ controller });
const server = new Server({ config, router, broker });

server.start(8080);
