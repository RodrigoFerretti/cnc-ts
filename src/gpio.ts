import { Gpio as _Gpio } from "onoff";

class GpioMock {
    constructor(..._args: any[]) {}
    writeSync = (..._args: any[]) => undefined;
    readSync = (..._args: any[]) => 0;
}

export const Gpio = process.env.USE_GPIO_MOCK === "true" ? (GpioMock as never) : _Gpio;
