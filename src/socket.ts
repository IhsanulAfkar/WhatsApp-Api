import http from 'http';
import { Server } from 'socket.io';
import logger from './config/logger';

let io: Server;

export function initSocketServer(app: Express.Application): http.Server {
    const server = http.createServer(app);
    io = new Server(server, {
        // cors: { origin: '*' },
        cors: { origin: [`${process.env.CLIENT_URL}`, 'http://localhost:3000'] },
    });
    io.on('connection', (socket) => {
        logger.info(socket.id);
        socket.on('close', () => {
            console.log('WebSocket client disconnected');
        });
    });
    return server;
}

export function getSocketIO(): Server {
    if (!io) {
        throw new Error('Socket.IO server not initialized.');
    }
    return io;
}
