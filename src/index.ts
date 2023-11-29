import { Controller } from "./server/controller";
import { Gpio } from "onoff";
import { Sensor } from "./io/sensor";
import { Server } from "./server/server";
import { Service } from "./server/service";
import { Stepper } from "./io/stepper";
import { Coordinate } from "./math/coodinate";

const service = new Service({
    x: {
        stepper: new Stepper({
            directionPin: new Gpio(16, "out"),
            pulsePin: new Gpio(6, "out"),
            maxSpeed: 2000,
        }),

        homeSensor: new Sensor({
            pin: new Gpio(21, "high"),
        }),

        limitSensor: new Sensor({
            pin: new Gpio(27, "high"),
        }),
    },
    y: {
        stepper: new Stepper({
            directionPin: new Gpio(22, "out"),
            pulsePin: new Gpio(23, "out"),
            maxSpeed: 2000,
        }),

        homeSensor: new Sensor({
            pin: new Gpio(24, "in"),
        }),

        limitSensor: new Sensor({
            pin: new Gpio(25, "in"),
        }),
    },
    slave: {
        coordinate: Coordinate.Y,

        stepper: new Stepper({
            directionPin: new Gpio(18, "out"),
            pulsePin: new Gpio(17, "out"),
            maxSpeed: 2000,
        }),

        homeSensor: new Sensor({
            pin: new Gpio(19, "in"),
        }),

        limitSensor: new Sensor({
            pin: new Gpio(20, "in"),
        }),
    },
    z: {
        stepper: new Stepper({
            directionPin: new Gpio(26, "out"),
            pulsePin: new Gpio(13, "out"),
            maxSpeed: 2000,
        }),

        homeSensor: new Sensor({
            pin: new Gpio(5, "high"),
        }),

        limitSensor: new Sensor({
            pin: new Gpio(12, "high"),
        }),
    },
});

const controller = new Controller(service);
const server = new Server(controller);

server.start(8080);
