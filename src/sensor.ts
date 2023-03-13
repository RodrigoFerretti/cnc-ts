export class Sensor {
    private reading: boolean;

    constructor() {
        this.reading = true;
    }

    public read = () => {
        this.reading = true;
    };

    public getReading = () => {
        return this.reading;
    };
}

export namespace Sensor {}
