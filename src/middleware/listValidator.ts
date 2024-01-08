import { body } from "express-validator";

export const emailValidation = body('email').isEmail().withMessage('Invalid Email')

export const passwordValidation = body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')

export const registerValidator = [
    emailValidation,
    passwordValidation
]

export const requestVariableValidation = (reqVar: string) => body(reqVar).trim().notEmpty()