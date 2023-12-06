import { Gpio } from "onoff";
import { Stepper } from "./io/stepper";
import { Controller } from "./server/controller";
import { Server } from "./server/server";
import { Service } from "./server/service";
import config from "./config.json";
import { Sensor } from "./io/sensor";

const service = new Service({
    x: {
        stepper: new Stepper({
            directionPin: [new Gpio(config.x.dir, "out")],
            pulsePin: [new Gpio(config.x.pul, "out")],
            maxSpeed: config.x.max,
            inverted: true,
        }),
        homeSensor: [new Sensor(new Gpio(config.x.hom, "in"))],
        limitSensor: [new Sensor(new Gpio(config.x.lim, "in"))],
    },
    y: {
        stepper: new Stepper({
            directionPin: [new Gpio(config.y.dir, "out"), new Gpio(config.a.dir, "out")],
            pulsePin: [new Gpio(config.y.pul, "out"), new Gpio(config.a.pul, "out")],
            maxSpeed: config.y.max,
        }),
        homeSensor: [new Sensor(new Gpio(config.y.hom, "in")), new Sensor(new Gpio(config.a.hom, "in"))],
        limitSensor: [new Sensor(new Gpio(config.y.lim, "in")), new Sensor(new Gpio(config.a.lim, "in"))],
    },
    z: {
        stepper: new Stepper({
            directionPin: [new Gpio(config.z.dir, "out")],
            pulsePin: [new Gpio(config.z.pul, "out")],
            maxSpeed: config.z.max,
        }),
        homeSensor: [new Sensor(new Gpio(config.z.hom, "in"))],
        limitSensor: [new Sensor(new Gpio(config.z.lim, "in"))],
    },
});

const controller = new Controller(service);
const server = new Server(controller);

server.start(8080);
