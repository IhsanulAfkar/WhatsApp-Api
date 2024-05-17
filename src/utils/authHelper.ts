const nodemailer = require('nodemailer')
// const speakeasy = require('speakeasy')
import speakeasy from 'speakeasy'
import logger from '../config/logger'
// import { oauth2 } from 'googleapis/build/src/apis/oauth2'
import { google } from 'googleapis'

export function generateOTPSecret(): string {
    const secret = speakeasy.generateSecret()
    return secret.base32
}

export function generateOTPToken(secret: string): string {
    const token = speakeasy.totp({
        secret: secret,
        encoding: 'base32',
    })
    return token
}

export function verifyOTPToken(secret: string, token: string): boolean {
    const isValid = speakeasy.totp.verify({
        secret: secret,
        encoding: 'base32',
        token: token,
        window: 1,
    })
    return isValid
}
const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: process.env.NODEMAILER_EMAIL,
        pass: process.env.NODEMAILER_PASSWORD,
    }
});
export async function sendEmail(toEmail: string, body: string, subject: string) {
    try {
        let mailOptions = {
            from: process.env.NODEMAILER_EMAIL,
            to: toEmail,
            subject: subject,
            html: body
        };
        await transporter.sendMail(mailOptions, (error: any, info: any) => {
            if (error) {
                console.log(error);
                throw error
            } else {
                console.log("Message sent: %s", info.messageId);
            }
        })
    } catch (error) {
        // logger.error('Error sending email', error)
        console.log('Error sending email', error)
        throw error
    }
}
