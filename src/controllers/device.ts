import { RequestHandler } from "express";
import prisma from "../utils/db";
import { generateUuid, isUUID } from "../utils/uuid";

export const create: RequestHandler = async (req, res) => {
    try {
        const name = req.body.name
        const pkId = req.authenticatedUser.pkId
        if (!name) {
            return res.status(400).json({
                message: "Name cannot be empty"
            })
        }
        const apiKey = generateUuid()
        const device = await prisma.device.create({
            data: {
                name,
                apiKey,
                user: {
                    connect: {
                        pkId
                    }
                }
            }
        })
        res.status(200).json({ message: 'Device created successfully', data: device });

    } catch (error) {
        console.log(error)
        return res.status(500).json({ error })
    }
}

export const getDevices: RequestHandler = async (req, res) => {
    const pkId = req.authenticatedUser.pkId
    try {
        const devices = await prisma.device.findMany({
            where: {
                userId: pkId
            }
        })
        return res.status(200).json(devices)
    } catch (error) {
        console.log('get device')
        console.log(error)
        return res.status(500).json({ error })
    }
}

export const getDevice: RequestHandler = async (req, res) => {
    const deviceId = req.params.deviceId
    if (!isUUID(deviceId)) {
        return res.status(400).json({ message: 'Invalid deviceId' });
    }
    try {
        const device = await prisma.device.findUnique({
            where: {
                id: deviceId
            }
        })
        if (!device) {
            return res.status(404).json({ message: "Device not found" })
        }
        return res.status(200).json(device)
    } catch (error) {
        console.log('get device detail')
        console.log(error)
        return res.status(500).json({ error })
    }
} 