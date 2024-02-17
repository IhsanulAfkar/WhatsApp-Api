import { RequestHandler } from "express";
import logger from "../config/logger";
import prisma from "../utils/db";
import { isUUID } from "../utils/uuid";

export const deviceMiddleware: RequestHandler = async (req, res, next) => {
    const deviceId = req.params.deviceId
    const userId = req.authenticatedUser.pkId
    if (!deviceId)
        return res.status(400).json({ message: "deviceId cannot be empty" })
    if (!isUUID(deviceId))
        return res.status(400).json({ message: "invalid deviceId" })
    try {
        const device = await prisma.device.findFirst({
            where: { AND: [{ id: deviceId }, { userId }] }
        })
        if (!device)
            return res.status(400).json({ message: "invalid deviceId" })
        req.device = device
        next()
    } catch (error) {
        logger.error(error)
        return res.status(500).json({ error: error })
    }
}