import express, { Express } from "express";
import cors from 'cors'
import bodyParser from "body-parser"
import http from 'http'
import compression from 'compression'
import prisma from "./utils/db";
import router from "./routes";
import logger from './config/logger'
import pinoHttp from 'pino-http'
import { initSocketServer } from "./socket";
import { init } from "./whatsapp";
require('dotenv').config()
const app: Express = express();
const port = Number(process.env.PORT || 3000);
const host = process.env.HOST || "0.0.0.0"
app.use(pinoHttp({ logger }))
app.use(cors())
app.use(compression())
app.use(bodyParser.json({ limit: '50mb' }))
app.use(bodyParser.urlencoded({ extended: true, limit: '500mb' }))
app.use(express.json())
app.use(router)
const server: http.Server = initSocketServer(app)
const listener = () => {

    console.log(`Server is listening on http://${host}:${port}`)
    logger.info(`Server is listening on http://${host}:${port}`)
}
prisma
    .$connect()
    .then(() => {
        logger.info('Connected to the database server');
    })
    .catch((error) => {
        logger.error('Failed to connect to the database server:', error);
        process.exit(1);
    });

(async () => {
    await init();
    server.listen(port, host, listener);
})();

export default app;
