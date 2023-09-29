import { BinaryValue } from "onoff";

export class Debouncer {
    private debounceTime: number;
    private previousReading: number;
    private readingChangeTime: number;

    constructor(options: Debounce.Options) {
        this.debounceTime = options.time;
        this.previousReading = 0;
        this.readingChangeTime = 0;
    }

    public debounce = (reading: BinaryValue) => {
        const now = performance.now();

        this.readingChangeTime = reading === this.previousReading ? this.readingChangeTime : now;
        this.previousReading = reading;

        return this.readingChangeTime - now > this.debounceTime ? reading : 0;
    };
}

export namespace Debounce {
    export type Options = {
        time: number;
    };
}
