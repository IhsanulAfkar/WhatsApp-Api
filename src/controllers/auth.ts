import { RequestHandler } from "express";
import bcrypt from 'bcrypt'
import prisma from "../utils/db";
import { generateAccessToken, generateRefreshToken } from "../utils/jwt";
export const register: RequestHandler = async (req, res) => {
    try {
        const {
            firstName,
            lastName,
            username,
            email,
            password,
            confirmPassword
        } = req.body
        if (password !== confirmPassword) {
            return res.status(400).json({ message: "password and confirm password not match" })
        }
        const hashPassword = await bcrypt.hash(password, 10)
        const checkUser = await prisma.user.findFirst({
            where: {
                OR: [{ username }, { email }]
            }
        })
        if (checkUser) {
            return res.status(400).json({ message: "User already exist" })
        }
        const newUser = await prisma.user.create({
            data: {
                username,
                firstName,
                lastName,
                password: hashPassword,
                email,
            }
        })
        const accessToken = generateAccessToken(newUser)
        const refreshToken = generateRefreshToken(newUser)
        await prisma.user.update({
            where: { id: newUser.id },
            data: {
                refreshToken
            }
        })
        res.status(200).json({
            accessToken,
            refreshToken,
            id: newUser.id
        })

    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: error })
    }
}
export const login: RequestHandler = async (req, res) => {
    try {
        const { identifier, password } = req.body
        const user = await prisma.user.findFirst({
            where: {
                OR: [
                    {
                        email: identifier
                    }, {
                        phone: identifier
                    }, {
                        username: identifier
                    }
                ]
            }
        })
        if (!user) {
            return res.status(401).json({
                message: "Account not found"
            })
        }
        const checkPassword = await bcrypt.compare(password, user.password)
        if (!checkPassword) {
            return res.status(401).json({ message: 'Invalid Password' })
        }
        const accessToken = generateAccessToken(user)
        const refreshToken = generateRefreshToken(user)
        await prisma.user.update({
            where: { id: user.id },
            data: {
                refreshToken
            }
        })
        return res.status(200).json({
            accessToken,
            refreshToken,
            id: user.id
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: error })
    }
}