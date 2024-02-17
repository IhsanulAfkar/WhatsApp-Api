import { RequestHandler } from "express";
import logger from "../config/logger";
import prisma from "../utils/db";

export const getUser: RequestHandler = async (req, res) => {
    const user: any = req.authenticatedUser
    delete user.password
    delete user.refreshToken
    delete user.pkId

    return res.status(200).json(user)
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