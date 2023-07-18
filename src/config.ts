import fs from "fs";
import path from "path";
import { z } from "zod";

export class Config {
    private data: Config.Data;
    private filePath: string;

    constructor(options: Config.Options) {
        this.filePath = path.resolve(__dirname, options.relativePath);
        this.data = this.readData();
    }

    private readData = (): Config.Data => {
        if (!fs.existsSync(this.filePath)) {
            const data = Object.values(Config.Keys).reduce((config, key) => ({ ...config, [key]: 0 }), {});
            this.writeData(data as Config.Data);
        }

        return JSON.parse(fs.readFileSync(this.filePath).toString());
    };

    private writeData = (data: Config.Data) => {
        fs.writeFileSync(this.filePath, JSON.stringify(data, null, 4));
    };

    public getData = () => this.data;

    public setData = (data: Config.Data) => {
        this.data = data;
        this.writeData(data);
    };
}

export namespace Config {
    export type Options = {
        relativePath: string;
    };

    export enum Keys {
        XAxisHomeSensorPin = "xAxisHomeSensorPin",
        YAxisHomeSensorPin = "yAxisHomeSensorPin",
        ZAxisHomeSensorPin = "zAxisHomeSensorPin",
        XAxisLimitSensorPin = "xAxisLimitSensorPin",
        YAxisLimitSensorPin = "yAxisLimitSensorPin",
        ZAxisLimitSensorPin = "zAxisLimitSensorPin",
        XAxisStepperPosition = "xAxisStepperPosition",
        YAxisStepperPosition = "yAxisStepperPosition",
        ZAxisStepperPosition = "zAxisStepperPosition",
        XAxisStepperPulsePin = "xAxisStepperPulsePin",
        YAxisStepperPulsePin = "yAxisStepperPulsePin",
        ZAxisStepperPulsePin = "zAxisStepperPulsePin",
        XAxisStepperMaxSpeed = "xAxisStepperMaxSpeed",
        YAxisStepperMaxSpeed = "yAxisStepperMaxSpeed",
        ZAxisStepperMaxSpeed = "zAxisStepperMaxSpeed",
        XAxisStepperEnablePin = "xAxisStepperEnablePin",
        YAxisStepperEnablePin = "yAxisStepperEnablePin",
        ZAxisStepperEnablePin = "zAxisStepperEnablePin",
        XAxisStepperDirectionPin = "xAxisStepperDirectionPin",
        YAxisStepperDirectionPin = "yAxisStepperDirectionPin",
        ZAxisStepperDirectionPin = "zAxisStepperDirectionPin",
        XAxisHomeSensorDebounceTime = "xAxisHomeSensorDebounceTime",
        YAxisHomeSensorDebounceTime = "yAxisHomeSensorDebounceTime",
        ZAxisHomeSensorDebounceTime = "zAxisHomeSensorDebounceTime",
        XAxisLimitSensorDebounceTime = "xAxisLimitSensorDebounceTime",
        YAxisLimitSensorDebounceTime = "yAxisLimitSensorDebounceTime",
        ZAxisLimitSensorDebounceTime = "zAxisLimitSensorDebounceTime",
    }

    export type Data = z.infer<typeof dataSchema>;

    export const dataSchema = z.object(
        Object.values(Config.Keys).reduce(
            (result, configKey) => ({ ...result, [configKey]: z.number().int().nonnegative() }),
            {} as Record<Config.Keys, z.ZodNumber>
        )
    );
}
