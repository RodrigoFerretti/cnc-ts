import { Broker } from "./broker";
import { Config } from "./config";
import { Controller } from "./controller";
import { Gpio } from "./gpio";
import { Router } from "./router";
import { Sensor } from "./sensor";
import { Server } from "./server";
import { Service } from "./service";
import { Stepper } from "./stepper";

const config = new Config({ relativePath: "../config.json" });
const configData = config.getData();

const stepperX = new Stepper({
    directionPin: new Gpio(configData.xAxisStepperDirectionPin, "out"),
    enablePin: new Gpio(configData.xAxisStepperEnablePin, "out"),
    pulsePin: new Gpio(configData.xAxisStepperPulsePin, "out"),
    maxSpeed: configData.xAxisStepperMaxSpeed,
});

const stepperY = new Stepper({
    directionPin: new Gpio(configData.yAxisStepperDirectionPin, "out"),
    enablePin: new Gpio(configData.yAxisStepperEnablePin, "out"),
    pulsePin: new Gpio(configData.yAxisStepperPulsePin, "out"),
    maxSpeed: configData.yAxisStepperMaxSpeed,
});

const stepperZ = new Stepper({
    directionPin: new Gpio(configData.zAxisStepperDirectionPin, "out"),
    enablePin: new Gpio(configData.zAxisStepperEnablePin, "out"),
    pulsePin: new Gpio(configData.zAxisStepperPulsePin, "out"),
    maxSpeed: configData.zAxisStepperMaxSpeed,
});

const homeSensorX = new Sensor({
    pin: new Gpio(configData.xAxisHomeSensorPin, "in"),
    debounceTime: configData.xAxisHomeSensorDebounceTime,
});

const homeSensorY = new Sensor({
    pin: new Gpio(configData.yAxisHomeSensorPin, "in"),
    debounceTime: configData.yAxisHomeSensorDebounceTime,
});

const homeSensorZ = new Sensor({
    pin: new Gpio(configData.zAxisHomeSensorPin, "in"),
    debounceTime: configData.zAxisHomeSensorDebounceTime,
});

const limitSensorX = new Sensor({
    pin: new Gpio(configData.xAxisLimitSensorPin, "in"),
    debounceTime: configData.xAxisLimitSensorDebounceTime,
});

const limitSensorY = new Sensor({
    pin: new Gpio(configData.yAxisLimitSensorPin, "in"),
    debounceTime: configData.yAxisLimitSensorDebounceTime,
});

const limitSensorZ = new Sensor({
    pin: new Gpio(configData.zAxisLimitSensorPin, "in"),
    debounceTime: configData.zAxisLimitSensorDebounceTime,
});

const axes: Service.Axes = {
    x: { stepper: stepperX, homeSensor: homeSensorX, limitSensor: limitSensorX },
    y: { stepper: stepperY, homeSensor: homeSensorY, limitSensor: limitSensorY },
    z: { stepper: stepperZ, homeSensor: homeSensorZ, limitSensor: limitSensorZ },
};

const broker = new Broker();
const service = new Service({ broker, axes });
const controller = new Controller({ config, service });
const router = new Router({ controller });
const server = new Server({ router, broker });

server.start(8080);
