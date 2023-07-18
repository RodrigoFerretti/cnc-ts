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

const stepperX = new Stepper({
    directionPin: new Gpio(config.data[Config.Name.XAxisStepperDirectionPin], "out"),
    enablePin: new Gpio(config.data[Config.Name.XAxisStepperEnablePin], "out"),
    pulsePin: new Gpio(config.data[Config.Name.XAxisStepperPulsePin], "out"),
    maxSpeed: config.data[Config.Name.XAxisStepperMaxSpeed],
});

const stepperY = new Stepper({
    directionPin: new Gpio(config.data[Config.Name.YAxisStepperDirectionPin], "out"),
    enablePin: new Gpio(config.data[Config.Name.YAxisStepperEnablePin], "out"),
    pulsePin: new Gpio(config.data[Config.Name.YAxisStepperPulsePin], "out"),
    maxSpeed: config.data[Config.Name.YAxisStepperMaxSpeed],
});

const stepperZ = new Stepper({
    directionPin: new Gpio(config.data[Config.Name.ZAxisStepperDirectionPin], "out"),
    enablePin: new Gpio(config.data[Config.Name.ZAxisStepperEnablePin], "out"),
    pulsePin: new Gpio(config.data[Config.Name.ZAxisStepperPulsePin], "out"),
    maxSpeed: config.data[Config.Name.ZAxisStepperMaxSpeed],
});

const homeSensorX = new Sensor({
    pin: new Gpio(config.data[Config.Name.XAxisHomeSensorPin], "in"),
    debounceTime: config.data[Config.Name.XAxisHomeSensorDebounceTime],
});

const homeSensorY = new Sensor({
    pin: new Gpio(config.data[Config.Name.YAxisHomeSensorPin], "in"),
    debounceTime: config.data[Config.Name.YAxisHomeSensorDebounceTime],
});

const homeSensorZ = new Sensor({
    pin: new Gpio(config.data[Config.Name.ZAxisHomeSensorPin], "in"),
    debounceTime: config.data[Config.Name.ZAxisHomeSensorDebounceTime],
});

const limitSensorX = new Sensor({
    pin: new Gpio(config.data[Config.Name.XAxisLimitSensorPin], "in"),
    debounceTime: config.data[Config.Name.XAxisLimitSensorDebounceTime],
});

const limitSensorY = new Sensor({
    pin: new Gpio(config.data[Config.Name.YAxisLimitSensorPin], "in"),
    debounceTime: config.data[Config.Name.YAxisLimitSensorDebounceTime],
});

const limitSensorZ = new Sensor({
    pin: new Gpio(config.data[Config.Name.ZAxisLimitSensorPin], "in"),
    debounceTime: config.data[Config.Name.ZAxisLimitSensorDebounceTime],
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
