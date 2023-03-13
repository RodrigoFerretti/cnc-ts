export class Sensor {
    public reading: boolean;

    constructor() {
        this.reading = true;
    }

    public read = (): boolean => {
        this.reading = true;
        return this.reading;
    };
}

export namespace Sensor {}
