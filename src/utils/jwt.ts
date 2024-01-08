import { User } from "@prisma/client"
import jwt from 'jsonwebtoken'
export const jwtSecret = process.env.JWT_SECRET!

export const generateAccessToken = (user: User) => {
    const payload = {
        email: user.email
    }
    return jwt.sign(payload, jwtSecret, { expiresIn: '1d' })
}

export const generateRefreshToken = (user: User) => {
    const payload = {
        id: user.id
    }
    return jwt.sign(payload, jwtSecret, { expiresIn: '7d' });
}