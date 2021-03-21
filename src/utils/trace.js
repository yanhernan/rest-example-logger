export class Trace {
    currentTrace;
    static setTrace(trace) {
        this.currentTrace = trace;
    }

    static getTrace() {
        return this.currentTrace;
    }
}