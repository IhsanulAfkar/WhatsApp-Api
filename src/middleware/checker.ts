import { RequestHandler } from "express";
import logger from "../config/logger";
import prisma from "../utils/db";
import { isUUID } from "../utils/uuid";

export const deviceMiddleware: RequestHandler = async (req, res, next) => {
    // const deviceId = req.params.deviceId
    const userId = req.authenticatedUser.pkId

    try {
        const device = await prisma.device.findFirst({
            where: { userId },
        })
        if (!device)
            return res.status(400).json({ message: "Device not connected" })
        req.device = device
        next()
    } catch (error) {
        logger.error(error)
        return res.status(500).json({ error: error })
    }
}