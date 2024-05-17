import { RequestHandler } from "express";
import logger from "../config/logger";
import prisma from "../utils/db";
import { isUUID } from "../utils/uuid";

export const getUser: RequestHandler = async (req, res) => {
    const user: any = req.authenticatedUser
    const device = await prisma.device.findFirst({
        where: {
            userId: user.pkId
        }
    })
    delete user.password
    delete user.refreshToken
    delete user.pkId
    // find device
    return res.status(200).json({
        ...user,
        deviceId: device?.id
    })
}
export const editUser: RequestHandler = async (req, res) => {
    const { firstName, lastName, username } = req.body
    const user = req.authenticatedUser
    try {
        // check if username is taken
        const checkUsername = await prisma.user.findFirst({
            where: {
                username,
                NOT: [{ id: user.id }]
            }
        })
        if (username && checkUsername)
            return res.status(400).json({ message: "username already exist" })
        await prisma.user.update({
            where: {
                id: user.id
            },
            data: {
                firstName: firstName || user.firstName,
                lastName: lastName || user.lastName,
                username: username || user.username,
                updatedAt: new Date()
            }
        })
        return res.status(200).json({ message: "user updated successfully" })
    } catch (error) {
        logger.error(error)
        console.log(error)
        res.status(500).json({ error: "internal server error" })
    }
}
export const changeEmail: RequestHandler = async (req, res) => {
    const { email } = req.body;
    const userId = req.params.userId;

    if (!isUUID(userId)) {
        return res.status(400).json({ message: 'Invalid userId' });
    }

    const existingUser = await prisma.user.findUnique({
        where: {
            email,
            NOT: { id: userId },
        },
    });
    if (existingUser) {
        return res.status(400).json({ message: 'User with this email already exists' });
    }

    const user = await prisma.user.findUnique({
        where: { id: userId },
    });

    if (!user) {
        return res.status(404).json({ message: 'User to update not found' });
    }

    await prisma.user.update({
        where: {
            id: userId,
        },
        data: {
            email,
            emailOtpSecret: email && email == user.email ? user.emailOtpSecret : null,
            emailVerifiedAt: email && email == user.email ? user.emailVerifiedAt : null,
            updatedAt: new Date(),
        },
    });

    return res.status(200).json({ message: 'Email changed successfully' });
}

export const changePhoneNumber: RequestHandler = async (req, res) => {
    const { phoneNumber } = req.body;
    const userId = req.params.userId;

    if (!isUUID(userId)) {
        return res.status(400).json({ message: 'Invalid userId' });
    }

    const existingUser = await prisma.user.findUnique({
        where: {
            phone: phoneNumber,
            NOT: { id: userId },
        },
    });
    if (existingUser) {
        return res.status(400).json({ message: 'User with this phone already exists' });
    }

    const user = await prisma.user.findUnique({
        where: { id: userId },
    });

    if (!user) {
        return res.status(404).json({ message: 'User to update not found' });
    }

    await prisma.user.update({
        where: {
            id: userId,
        },
        data: {
            phone: phoneNumber,
            // emailOtpSecret: email && email == user.email ? user.emailOtpSecret : null,
            // emailVerifiedAt: email && email == user.email ? user.emailVerifiedAt : null,
            updatedAt: new Date(),
        },
    });

    return res.status(200).json({ message: 'Phone number changed successfully' });
}
