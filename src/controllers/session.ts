import { RequestHandler } from "express";
import prisma from "../utils/db";
import { createInstance } from "../whatsapp";
import { generateUuid } from "../utils/uuid";
import logger from "../config/logger";

export const createSession: RequestHandler = async (req, res) => {
    try {
        const { deviceId } = req.body
        const sessionId = generateUuid()
        const userId = req.authenticatedUser.id
        const device = await prisma.device.findUnique({
            where: { id: deviceId }
        })
        if (!device) {
            return res.status(404).json({ message: 'Device not found' })
        }
        const checkSession = await prisma.session.findFirst({
            where: { deviceId: device.pkId, device: { status: 'open' } }
        })
        if (checkSession) {
            res.status(404).json({ message: 'Device already linked' })
        }
        console.log("create instance...")
        createInstance({ sessionId, deviceId: device.pkId, res, userId })
    } catch (error) {
        logger.error(error)
        return res.status(500).json({ error: error })
    }
}

export const getAllSessions: RequestHandler = async (req, res) => {
    try {
        const pkId = req.authenticatedUser.pkId;

        const sessions = await prisma.session.findMany({
            where: {
                device: {
                    userId: pkId,
                },
                id: { contains: 'config' },
            },
            select: {
                sessionId: true,
                device: { select: { id: true, phone: true, status: true } },
            },
        });

        res.status(200).json(sessions);
    } catch (error) {
        logger.error(error)
        res.status(500).json({ error: error })
    }
}