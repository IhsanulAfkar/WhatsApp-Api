import { RequestHandler } from "express"
import bcrypt from 'bcrypt'
import prisma from "../utils/db"
import { generateAccessToken, generateRefreshToken } from "../utils/jwt"
import jwt from 'jsonwebtoken'
import logger from "../config/logger"
import { generateUuid } from "../utils/uuid"
import axios from "axios"
import passport from "passport"
import { Strategy as GoogleStrategy, Profile } from "passport-google-oauth20"
import refresh from 'passport-oauth2-refresh'
import { generateOTPSecret, generateOTPToken, sendEmail, verifyOTPToken } from "../utils/authHelper"
import { RefreshToken } from "../types"
import { initProducts } from "../utils/products"
export const register: RequestHandler = async (req, res) => {
    try {
        const {
            firstName,
            lastName,
            username,
            email,
            password,
            phone,
            confirmPassword
        } = req.body
        if (password !== confirmPassword) {
            return res.status(400).json({ message: "password and confirm password not match" })
        }
        const error: { [key: string]: string } = {};
        // check username, email, phone

        const [checkUsername, checkEmail, checkPhone] = await Promise.all([
            await prisma.user.findFirst({
                where: {
                    username
                }
            }),
            await prisma.user.findFirst({
                where: {
                    email
                }
            }),
            await prisma.user.findFirst({
                where: {
                    phone
                }
            })
        ])
        if (checkUsername)
            error.username = "Username already taken"
        if (checkEmail)
            error.email = "Email already taken"
        if (checkPhone)
            error.phone = "Phone number already taken"
        if (Object.keys(error).length > 0) {
            return res.status(400).json({ error });
        }
        const hashPassword = await bcrypt.hash(password, 10)
        const newUser = await prisma.user.create({
            data: {
                username,
                firstName,
                lastName,
                phone,
                password: hashPassword,
                email,
            }
        })
        // insert products
        const result = await initProducts(newUser.pkId)
        if (result) {
            res.status(500).json({ "message": "server error" })
        }
        const accessToken = generateAccessToken(newUser)
        const refreshToken = generateRefreshToken(newUser)
        await prisma.user.update({
            where: { id: newUser.id },
            data: {
                refreshToken
            }
        })
        // create device 
        // just to be safe, check if phone exist
        const findDevice = await prisma.device.findFirst({
            where: {
                phone
            }
        })
        if (findDevice) {
            res.status(400).json({
                error: "Phone number already used in device"
            })
        }
        const apiKey = generateUuid()
        const device = await prisma.device.create({
            data: {
                name: username,
                apiKey,
                user: {
                    connect: {
                        pkId: newUser.pkId
                    }
                }
            }
        })
        res.status(200).json({
            accessToken,
            refreshToken,
            id: newUser.id,
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ error })
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

export const refreshToken: RequestHandler = async (req, res) => {
    try {
        const { refreshToken } = req.body;

        jwt.verify(refreshToken, process.env.JWT_SECRET!, async (err: unknown, decoded: unknown) => {
            if (err) {
                return res.status(401).json({ message: 'Invalid refresh token' });
            }
            if (!decoded || !(decoded as RefreshToken).id) {
                return res.status(401).json({ message: 'Decoded token is missing' });
            }

            const userId = (decoded as RefreshToken).id;

            const user = await prisma.user.findUnique({
                where: { id: userId },
            });

            if (!user) {
                return res.status(401).json({ message: 'User not found' });
            }

            const accessToken = generateAccessToken(user);
            const id = user.id;

            return res.status(200).json({ accessToken, id });
        });
    } catch (error) {
        logger.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

// mock get google access token by client
const strategy = new GoogleStrategy(
    {
        clientID: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        callbackURL:
            process.env.NODE_ENV !== 'production'
                ? `http://${process.env.HOST}:${process.env.PORT}/auth/google/callback`
                : `https://${process.env.BASE_URL}/auth/google/callback`,
    },
    async (accessToken: any, refreshToken: any, done: any) => {
        try {
            logger.warn(refreshToken)
            return done(null, accessToken)
        } catch (error: any) {
            return done(error, false)
        }
    },
)

passport.use(strategy)
refresh.use(strategy)
export const googleAuth = passport.authenticate('google', {
    scope: [
        'profile',
        'email',
        'https://www.googleapis.com/auth/user.phonenumbers.read',
        'https://www.googleapis.com/auth/contacts',
        'https://www.googleapis.com/auth/contacts.readonly',
    ],
})
export const googleAuthCallback: RequestHandler = (req, res, next) => {
    passport.authenticate('google', { session: true }, async (err, accessToken) => {
        try {
            if (err) {
                return res.status(500).json({ message: err.message })
            }

            if (!accessToken) {
                return res.status(401).json({ message: 'Authentication failed' })
            }

            res.status(200).json({ accessToken })
        } catch (error) {
            return res.status(500).json({ message: 'Internal erver error' })
        }
    })(req, res, next)
}

export const sendVerificationEmail: RequestHandler = async (req, res) => {
    try {
        const user = req.authenticatedUser;
        const email = req.authenticatedUser.email;

        if (!user) {
            return res
                .status(404)
                .json({ message: 'Email address does not exist in our database' });
        }

        const otpSecret = generateOTPSecret();
        const otpToken = generateOTPToken(otpSecret);
        const body = `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Email Verification</title>
        </head>
        <body>
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2>Email Verification</h2>
                <p>Hello, ${user.firstName}!</p>
                <p>
                    Thank you for signing up! To complete your registration, please use the following 6-digit verification code:
                </p>
                <h1 style="font-size: 36px; font-weight: bold; color: #007BFF;">${otpToken}</h1>
                <p>
                    This verification code will expire in 30 seconds. If you didn't sign up for our service, you can safely ignore this email.
                </p>
            </div>
        </body>
        </html>
        `;

        await prisma.user.update({
            where: { pkId: user.pkId },
            data: { emailOtpSecret: otpSecret, email, updatedAt: new Date() },
        });

        await sendEmail(email, body, 'Verify your email');
        res.status(200).json({ message: 'Verification email sent successfully', otpToken });
    } catch (error) {
        logger.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const verifyEmail: RequestHandler = async (req, res) => {
    try {
        const pkId = req.authenticatedUser.pkId;
        const otpToken = String(req.body.otpToken);

        const user = await prisma.user.findUnique({
            where: { pkId: pkId },
            select: { emailOtpSecret: true },
        });

        if (!user || !user.emailOtpSecret) {
            return res.status(401).json({ message: 'User not found or OTP secret missing' });
        }

        const isValid = verifyOTPToken(user.emailOtpSecret, otpToken);

        if (isValid) {
            await prisma.user.update({
                where: { pkId: pkId },
                data: { emailVerifiedAt: new Date(), updatedAt: new Date() },
            });
            return res.status(200).json({ message: 'Email verification successful' });
        } else {
            return res.status(401).json({ message: 'Invalid OTP token' });
        }
    } catch (error) {
        logger.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const forgotPassword: RequestHandler = async (req, res) => {
    try {
        const email = req.body.email;
        const user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
            return res
                .status(404)
                .json({ message: 'Email address does not exist in our database' });
        }

        const resetTokenSecret = generateOTPSecret();
        // const resetToken = generateOTPToken(resetTokenSecret);
        const body = `Hello ${user.username}, here's your forgot password code \n ${resetTokenSecret}`

        await prisma.passwordReset.upsert({
            where: { email },
            create: {
                email,
                token: resetTokenSecret,
                resetTokenExpires: new Date(Date.now() + 3600000), // Expires in 1 hour
            },
            update: {
                token: resetTokenSecret,
                resetTokenExpires: new Date(Date.now() + 3600000), // Expires in 1 hour
            },
        });

        await sendEmail(email, body, 'Reset password');
        res.status(200).json({ message: 'Password reset email sent' });
    } catch (error) {
        console.log("forgot password", error);
        logger.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const resetPassword: RequestHandler = async (req, res) => {
    try {
        const { resetToken, password } = req.body;
        const resetInfo = await prisma.passwordReset.findUnique({
            where: {
                token: resetToken,
            },
        });

        if (
            !resetInfo ||
            resetInfo.token !== resetToken ||
            resetInfo.resetTokenExpires <= new Date()
        ) {
            return res.status(401).json({ message: 'Invalid or expired reset token' });
        }

        const email = resetInfo.email;
        const hashedPassword = await bcrypt.hash(password, 10);

        await prisma.passwordReset.delete({
            where: {
                email,
            },
        });

        await prisma.user.update({
            where: { email },
            data: {
                password: hashedPassword,
                updatedAt: new Date(),
            },
        });

        res.status(200).json({ message: 'Password reset successful' });
    } catch (error) {
        logger.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const changePassword: RequestHandler = async (req, res) => {
    try {
        const { currentPassword, password, confirmPassword } = req.body;

        const email = req.authenticatedUser.email;
        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({ message: 'Passwords do not match' });
        }

        const passwordMatch = await bcrypt.compare(currentPassword, user.password);

        if (!passwordMatch) {
            return res.status(401).json({ message: 'Current password is incorrect' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await prisma.user.update({
            where: { email },
            data: {
                password: hashedPassword,
                updatedAt: new Date(),
            },
        });

        res.status(200).json({ message: 'Password change successful' });
    } catch (error) {
        logger.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const googleLoginRegister: RequestHandler = async (req, res) => {
    const accessToken = req.body.accessToken
    const apiEndpoint = 'https://people.googleapis.com/v1/people/me?personFields=names,emailAddresses,photos,phoneNumbers,birthdays'
    try {
        const response = await axios.get(apiEndpoint, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        })
        if (response.status >= 400 && response.status < 500) {
            return res.status(response.status).json({ message: "Invalid google access token" })
        }
        if (response.status === 200) {
            const profileData = response.data
            if (!profileData.emailAddresses || !profileData.names) {
                return res.status(400).json({ message: 'Missing some profile data' })
            }

            const googleId = profileData.names[0].metadata.source.id
            const username = profileData.emailAddresses[0].value.split('@')[0]
            const email = profileData.emailAddresses[0].value
            const phones = profileData.phoneNumbers || []
            const phone = phones.length > 0 ? phones[0].canonicalForm?.replace(/\+/g, '') : null
            const nameParts = profileData.names[0].displayNameLastFirst.split(',')
            const lastName = nameParts.length > 1 ? nameParts[0].trim() : null
            const firstName = lastName ? nameParts[1].trim() : nameParts[0].trim()

            const user = await prisma.user.findFirst({
                where: {
                    OR: [
                        { email, deletedAt: null },
                        { phone, deletedAt: null },
                        { username, deletedAt: null },
                        { googleId, deletedAt: null },
                    ],
                },
            })

            // forbid deleted user
            if (!user) {
                return res.status(401).json({ message: 'Account not found or has been deleted' })
            }

            const oAuthRegisteredUser = await prisma.user.findUnique({
                where: { googleId },
            })

            // login
            if (oAuthRegisteredUser) {
                const accessToken = generateAccessToken(oAuthRegisteredUser)
                // const refreshToken = oAuthRegisteredUser.refreshToken
                const refreshToken = generateRefreshToken(oAuthRegisteredUser)
                const id = oAuthRegisteredUser.id

                await prisma.user.update({
                    where: { pkId: oAuthRegisteredUser.pkId },
                    data: { refreshToken },
                })
                return res
                    .status(200)
                    .json({ accessToken, refreshToken, id })
            }

            // register user from start or connect existing user to google
            const newUser = await prisma.user.upsert({
                where: { email },
                create: {
                    googleId,
                    username,
                    firstName,
                    lastName,
                    accountApiKey: generateUuid(),
                    phone,
                    email,
                    password: '',
                    emailVerifiedAt: new Date(),
                },
                update: {
                    googleId,
                },
            })

            const accessToken = generateAccessToken(newUser)
            const accountApiKey = newUser.accountApiKey
            const id = newUser.id
            let refreshToken

            if (!newUser.refreshToken) {
                refreshToken = generateRefreshToken(newUser)
                await prisma.user.update({
                    where: { pkId: newUser.pkId },
                    data: { refreshToken },
                })
            } else {
                refreshToken = newUser.refreshToken
            }
            res.status(201).json({
                accessToken,
                refreshToken,
                accountApiKey,
                id
            })
        } else {
            const errorMessage = response.data?.error?.message || 'Unknown Error'
            res.status(response.status).json({ error: errorMessage })
        }
    } catch (error) {
        logger.error(error)
        console.log(error)
        res.status(500).json({ message: 'Internal server error' })
    }

} 