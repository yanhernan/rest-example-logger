import connect from 'connect';
import Midlewares from './middleware'
import http from 'http'
import { Logger } from './config/logger'
import { Trace } from './utils/trace';

const bootstrap = () => {
    Logger.setup();
    Logger.active().info({ port: 3000 }, 'Server Starting')
    const app = connect()
    app.use(Midlewares.Transactions.onError());
    app.use(Midlewares.Transactions.onRequest());

    app.use('/status', (req, res) => {
        res.writeHead(200);
        Logger.active().info({ traceId: Trace.getTrace() }, 'Check Status')
        res.write("up, trace: " + Trace.getTrace());
        res.end();
    });
    http.createServer(app).listen(3000, () => {
        Logger.active().info({ port: 3000 }, 'Server Started')
    });
}

bootstrap();