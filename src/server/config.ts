import fs from "fs";
import path from "path";
import { z } from "zod";

export class Config {
    private _data: Config.Data;
    private filePath: string;

    constructor(options: Config.Options) {
        this.filePath = path.resolve(__dirname, options.relativePath);
        this._data = this.readData();
    }

    private readData = (): Config.Data => {
        if (!fs.existsSync(this.filePath)) {
            const data = Object.values(Config.Name).reduce((config, key) => ({ ...config, [key]: 0 }), {});
            this.writeData(data as Config.Data);
        }

        return JSON.parse(fs.readFileSync(this.filePath).toString());
    };

    private writeData = (data: Config.Data) => {
        fs.writeFileSync(this.filePath, JSON.stringify(data, null, 4));
    };

    public get data() {
        return this._data;
    }

    public set data(data: Config.Data) {
        this._data = data;
        this.writeData(data);
    }
}

export namespace Config {
    export type Options = {
        relativePath: string;
    };

    export enum Name {
        XAxisHomeSensorPin = "x-axis-home-sensor-pin",
        YAxisHomeSensorPin = "y-axis-home-sensor-pin",
        ZAxisHomeSensorPin = "z-axis-home-sensor-pin",
        XAxisLimitSensorPin = "x-axis-limit-sensor-pin",
        YAxisLimitSensorPin = "y-axis-limit-sensor-pin",
        ZAxisLimitSensorPin = "z-axis-limit-sensor-pin",
        XAxisStepperPosition = "x-axis-stepper-position",
        YAxisStepperPosition = "y-axis-stepper-position",
        ZAxisStepperPosition = "z-axis-stepper-position",
        XAxisStepperPulsePin = "x-axis-stepper-pulse-pin",
        YAxisStepperPulsePin = "y-axis-stepper-pulse-pin",
        ZAxisStepperPulsePin = "z-axis-stepper-pulse-pin",
        XAxisStepperMaxSpeed = "x-axis-stepper-max-speed",
        YAxisStepperMaxSpeed = "y-axis-stepper-max-speed",
        ZAxisStepperMaxSpeed = "z-axis-stepper-max-speed",
        XAxisStepperEnablePin = "x-axis-stepper-enable-pin",
        YAxisStepperEnablePin = "y-axis-stepper-enable-pin",
        ZAxisStepperEnablePin = "z-axis-stepper-enable-pin",
        XAxisStepperDirectionPin = "x-axis-stepper-direction-pin",
        YAxisStepperDirectionPin = "y-axis-stepper-direction-pin",
        ZAxisStepperDirectionPin = "z-axis-stepper-direction-pin",
        XAxisHomeSensorDebounceTime = "x-axis-home-sensor-debounceTime",
        YAxisHomeSensorDebounceTime = "y-axis-home-sensor-debounceTime",
        ZAxisHomeSensorDebounceTime = "z-axis-home-sensor-debounceTime",
        XAxisLimitSensorDebounceTime = "x-axis-limit-sensor-debounceTime",
        YAxisLimitSensorDebounceTime = "y-axis-limit-sensor-debounceTime",
        ZAxisLimitSensorDebounceTime = "z-axis-limit-sensor-debounceTime",
    }

    export type Data = z.infer<typeof dataSchema>;

    export const dataSchema = z
        .object(
            Object.values(Config.Name).reduce(
                (result, configName) => ({ ...result, [configName]: z.number().int().nonnegative() }),
                {} as Record<Config.Name, z.ZodNumber>
            )
        )
        .strict();
}
