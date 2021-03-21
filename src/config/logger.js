import Pino from 'pino';

export class Logger {
    /**
     * @type {Pino.Logger}
     */
    static logger;
    static setup() {
        if (!this.logger) {
            this.logger = new Pino();
        }
    }
    /**
     * @returns {Pino.Logger}
     */
    static active() {
        return this.logger;
    }
}