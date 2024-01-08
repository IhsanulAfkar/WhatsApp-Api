import { RequestHandler } from "express"
import logger from "../config/logger"
import { generateColor } from "../utils/color"
import prisma from "../utils/db";

export const createContact: RequestHandler = async (req, res) => {
    try {
        const { firstName, lastName, phone, email, gender, dob, labels, deviceId } = req.body
        const pkId = req.authenticatedUser.pkId
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

        await prisma.$transaction(async (transaction) => {
            // step 1: create contact
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