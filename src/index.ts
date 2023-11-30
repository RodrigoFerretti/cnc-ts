import { Gpio } from "pigpio";
import { Sensor } from "./io/sensor";
import { Stepper } from "./io/stepper";
import { Controller } from "./server/controller";
import { Server } from "./server/server";
import { Service } from "./server/service";

const service = new Service({
    x: {
        stepper: new Stepper({
            directionPin: [
                new Gpio(16, {
                    mode: Gpio.OUTPUT,
                }),
            ],
            pulsePin: [
                new Gpio(6, {
                    mode: Gpio.OUTPUT,
                }),
            ],
            maxSpeed: 2000,
        }),
        homeSensor: [
            new Sensor({
                pin: new Gpio(21, {
                    mode: Gpio.INPUT,
                    pullUpDown: Gpio.PUD_UP,
                }),
            }),
        ],
        limitSensor: [
            new Sensor({
                pin: new Gpio(27, {
                    mode: Gpio.INPUT,
                    pullUpDown: Gpio.PUD_UP,
                }),
            }),
        ],
    },
    y: {
        stepper: new Stepper({
            directionPin: [
                new Gpio(22, {
                    mode: Gpio.OUTPUT,
                }),
                new Gpio(18, {
                    mode: Gpio.OUTPUT,
                }),
            ],
            pulsePin: [
                new Gpio(23, {
                    mode: Gpio.OUTPUT,
                }),
                new Gpio(17, {
                    mode: Gpio.OUTPUT,
                }),
            ],
            maxSpeed: 2000,
        }),
        homeSensor: [
            new Sensor({
                pin: new Gpio(24, {
                    mode: Gpio.INPUT,
                    pullUpDown: Gpio.PUD_DOWN,
                }),
            }),
            new Sensor({
                pin: new Gpio(19, {
                    mode: Gpio.INPUT,
                    pullUpDown: Gpio.PUD_DOWN,
                }),
            }),
        ],
        limitSensor: [
            new Sensor({
                pin: new Gpio(25, {
                    mode: Gpio.INPUT,
                    pullUpDown: Gpio.PUD_DOWN,
                }),
            }),
            new Sensor({
                pin: new Gpio(20, {
                    mode: Gpio.INPUT,
                    pullUpDown: Gpio.PUD_DOWN,
                }),
            }),
        ],
    },
    z: {
        stepper: new Stepper({
            directionPin: [
                new Gpio(26, {
                    mode: Gpio.OUTPUT,
                }),
            ],
            pulsePin: [
                new Gpio(13, {
                    mode: Gpio.OUTPUT,
                }),
            ],
            maxSpeed: 2000,
        }),
        homeSensor: [
            new Sensor({
                pin: new Gpio(5, {
                    mode: Gpio.INPUT,
                    pullUpDown: Gpio.PUD_UP,
                }),
            }),
        ],
        limitSensor: [
            new Sensor({
                pin: new Gpio(12, {
                    mode: Gpio.INPUT,
                    pullUpDown: Gpio.PUD_UP,
                }),
            }),
        ],
    },
});

const controller = new Controller(service);
const server = new Server(controller);

server.start(8080);
