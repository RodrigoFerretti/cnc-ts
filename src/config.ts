import fs from "fs";
import path from "path";

enum ConfigKeys {
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
    XAxisStepperMaxSpeed = 'xAxisStepperMaxSpeed',
    YAxisStepperMaxSpeed = 'yAxisStepperMaxSpeed',
    ZAxisStepperMaxSpeed = 'zAxisStepperMaxSpeed',
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

export type Config = {
    [key in ConfigKeys]: number;
};

export namespace Config {
    const filePath = path.resolve(__dirname, "../config.json");

    export const get = () => {
        if (fs.existsSync(filePath)) return JSON.parse(fs.readFileSync(filePath).toString()) as Config;
        const config = Object.values(ConfigKeys).reduce((config, key) => ({ ...config, [key]: 0 }), {} as Config);
        return set(config);
    };

    export const set = (config: Config) => {
        fs.writeFileSync(filePath, JSON.stringify(config, null, 4));
        return config;
    };
}
