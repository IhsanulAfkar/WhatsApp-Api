import { RequestHandler } from "express";
import jwt from "jsonwebtoken";
import { jwtSecret } from "../utils/jwt";
import { AccessToken } from "../types";
import prisma from "../utils/db";

export const authMiddleware: RequestHandler = (req, res, next) => {
    const tokenHeader = req.header('Authorization')
    if (!tokenHeader || !tokenHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            message: 'Invalid Token'
        })
    }
    const token = tokenHeader.split(' ')[1]
    if (!token) {
        return res.status(401).json({
            message: 'Invalid Token'
        })
    }
    jwt.verify(token, jwtSecret, async (err, tokenData) => {
        if (err) {
            return res.status(401).json({
                message: 'Invalid Token'
            })
        }
        const email = (tokenData as AccessToken).email

        const user = await prisma.user.findUnique({
            where: {
                email
            }
        })
        if (!user) {
            return res.status(401).json({
                message: 'Invalid Token'
            })
        }
        req.authenticatedUser = user
        next()
    })
} 