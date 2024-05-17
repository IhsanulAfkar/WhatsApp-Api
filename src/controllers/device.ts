import { RequestHandler } from "express"
import prisma from "../utils/db"
import { generateUuid, isUUID } from "../utils/uuid"
import logger from "../config/logger"
import fs from 'fs'
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
        res.status(200).json({ message: 'Device created successfully', data: device })

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
        return res.status(400).json({ message: 'Invalid deviceId' })
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

export const deleteDevices: RequestHandler = async (req, res) => {
    try {
        const deviceIds = req.body.deviceIds
        const userId = req.authenticatedUser.pkId
        if (!deviceIds || !Array.isArray(deviceIds) || deviceIds.length === 0) {
            return res.status(400).json({ message: 'Invalid deviceIds' })
        }

        const devicePromises = deviceIds.map(async (deviceId: string) => {
            const device = await prisma.device.findUnique({
                where: {
                    id: deviceId,
                    userId
                },
            })

            if (!device) {
                return { success: false, deviceId }
            }

            const deletedDevice = await prisma.device.delete({
                where: {
                    id: deviceId,
                },
            })

            await prisma.contact.deleteMany({
                where: {
                    contactDevices: { some: { device: { id: deviceId } } },
                },
            })

            // const subDirectoryPath = `media/D${deviceId}`

            // fs.rm(subDirectoryPath, { recursive: true }, (err) => {
            //     if (err) {
            //         console.error(`Error deleting sub-directory: ${err}`)
            //     } else {
            //         console.log(`Sub-directory ${subDirectoryPath} is deleted successfully.`)
            //     }
            // })

            return { success: true }
        })

        // wait for all the Promises to settle (either resolve or reject)
        const deviceResults = await Promise.all(devicePromises)
        const hasFailures = deviceResults.some((result) => !result.success)
        if (hasFailures) {
            const failedDeviceIds = deviceResults
                .filter((result) => !result.success)
                .map((result) => result.deviceId)
            return res
                .status(404)
                .json({ message: `Devices not found: ${failedDeviceIds.join(', ')}` })
        }

        res.status(200).json({ message: 'Device(s) deleted successfully' })
    } catch (error) {
        logger.error(error)
        console.log(error)
        res.status(500).json({ error: 'Internal server error' })
    }
}