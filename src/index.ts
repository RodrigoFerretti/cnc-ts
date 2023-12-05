import { Gpio } from "pigpio";
import { Stepper } from "./io/stepper";
import { Controller } from "./server/controller";
import { Server } from "./server/server";
import { Service } from "./server/service";
import config from "./config.json";

const service = new Service({
    x: {
        stepper: new Stepper({
            directionPin: [
                new Gpio(config.x.dir, {
                    mode: Gpio.OUTPUT,
                }),
            ],
            pulsePin: [
                new Gpio(config.x.pul, {
                    mode: Gpio.OUTPUT,
                }),
            ],
            maxSpeed: config.x.max,
            inverted: true,
        }),
        homeSensor: [
            new Gpio(config.x.hom, {
                mode: Gpio.INPUT,
                pullUpDown: Gpio.PUD_DOWN,
                alert: true,
            }),
        ],
        limitSensor: [
            new Gpio(config.x.lim, {
                mode: Gpio.INPUT,
                pullUpDown: Gpio.PUD_DOWN,
                alert: true,
            }),
        ],
    },
    y: {
        stepper: new Stepper({
            directionPin: [
                new Gpio(config.y.dir, {
                    mode: Gpio.OUTPUT,
                }),
                new Gpio(config.a.dir, {
                    mode: Gpio.OUTPUT,
                }),
            ],
            pulsePin: [
                new Gpio(config.y.pul, {
                    mode: Gpio.OUTPUT,
                }),
                new Gpio(config.a.pul, {
                    mode: Gpio.OUTPUT,
                }),
            ],
            maxSpeed: config.y.max,
        }),
        homeSensor: [
            new Gpio(config.y.hom, {
                mode: Gpio.INPUT,
                pullUpDown: Gpio.PUD_DOWN,
                alert: true,
            }),

            new Gpio(config.a.hom, {
                mode: Gpio.INPUT,
                pullUpDown: Gpio.PUD_DOWN,
                alert: true,
            }),
        ],
        limitSensor: [
            new Gpio(config.y.lim, {
                mode: Gpio.INPUT,
                pullUpDown: Gpio.PUD_DOWN,
                alert: true,
            }),
            new Gpio(config.a.lim, {
                mode: Gpio.INPUT,
                pullUpDown: Gpio.PUD_DOWN,
                alert: true,
            }),
        ],
    },
    z: {
        stepper: new Stepper({
            directionPin: [
                new Gpio(config.z.dir, {
                    mode: Gpio.OUTPUT,
                }),
            ],
            pulsePin: [
                new Gpio(config.z.pul, {
                    mode: Gpio.OUTPUT,
                }),
            ],
            maxSpeed: config.z.max,
        }),
        homeSensor: [
            new Gpio(config.z.hom, {
                mode: Gpio.INPUT,
                pullUpDown: Gpio.PUD_DOWN,
                alert: true,
            }),
        ],
        limitSensor: [
            new Gpio(config.z.lim, {
                mode: Gpio.INPUT,
                pullUpDown: Gpio.PUD_DOWN,
                alert: true,
            }),
        ],
    },
});

const controller = new Controller(service);
const server = new Server(controller);

server.start(8080);
