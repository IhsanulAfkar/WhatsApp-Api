import { RequestHandler } from "express"
import logger from "../config/logger"
import { generateColor } from "../utils/color"
import prisma from "../utils/db";

export const createContact: RequestHandler = async (req, res) => {
    try {
        console.log("start")
        const { firstName, lastName = '', phone, email = null, gender = null, deviceId } = req.body
        console.log("pkid")
        const pkId = req.authenticatedUser.pkId
        console.log("check contact")
        const existingContact = await prisma.contact.findFirst({
            where: {
                phone,
                AND: {
                    contactDevices: {
                        some: {
                            device: {
                                id: deviceId,
                                userId: pkId,
                            },
                        },
                    },
                },
            },
        })

        if (existingContact) {
            return res.status(400).json({
                message: 'Contact with this email or phone number already exists in your contact',
            })
        }
        console.log("start transaction")
        await prisma.$transaction(async (transaction) => {
            // step 1: create contact

            console.log("create contact transaction")
            const createdContact = await transaction.contact.create({
                data: {
                    firstName,
                    lastName,
                    phone,
                    email,
                    gender,
                    colorCode: generateColor(),
                },
            })

            console.log("check device transaction")
            const existingDevice = await transaction.device.findUnique({
                where: {
                    id: deviceId,
                },
                include: { sessions: { select: { sessionId: true } } },
            })

            if (!existingDevice) {
                return res.status(404).json({ message: 'Device not found' })
            }
            if (!existingDevice.sessions[0]) {
                return res.status(404).json({ message: 'Session not found' })
            }

            // step 3: replace contact info in outgoing & incoming message
            await transaction.outgoingMessage.updateMany({
                where: {
                    to: phone + '@s.whatsapp.net',
                    sessionId: existingDevice.sessions[0].sessionId,
                },
                data: {
                    contactId: createdContact.pkId,
                },
            })
            await transaction.incomingMessage.updateMany({
                where: {
                    from: phone + '@s.whatsapp.net',
                    sessionId: existingDevice.sessions[0].sessionId,
                },
                data: {
                    contactId: createdContact.pkId,
                },
            })

            // step 4: create contacts to devices relationship
            await transaction.contactDevice.create({
                data: {
                    contactId: createdContact.pkId,
                    deviceId: existingDevice.pkId,
                },
            })
            res.status(200).json({ message: 'Contact created successfully' })
        })
    } catch (error) {
        logger.error(error)
        res.status(500).json({ message: 'Internal server error' })
    }
}
export const getAllContacts: RequestHandler = async (req, res) => {
    try {
        const userId = req.authenticatedUser.pkId
        const deviceId = req.query.deviceId as string
        if (deviceId) {
            const checkDevice = await prisma.device.findFirst({
                where: {
                    AND: [{ id: deviceId }, { userId }]
                }
            })
            return res.status(400).json({
                message: "invalid deviceId"
            })
        }
        const contacts = await prisma.contact.findMany({
            where: {
                contactDevices: {
                    some: {
                        device: {
                            id: deviceId ?? undefined,
                            userId
                        }
                    }
                }
            }
        })
        return res.status(200).json(contacts)
    } catch (error) {
        logger.error(error)
        res.status(500).json({ message: 'Internal server error' })
    }

}