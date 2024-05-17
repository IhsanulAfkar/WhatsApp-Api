import { Router } from "express"
import * as controller from '../controllers/auth'
import { validate } from "../middleware/validator"
import { registerValidator } from "../middleware/listValidator"
import { authMiddleware } from "../middleware/auth"
const router = Router()
router.post('/register', registerValidator, validate, controller.register)
router.post('/login', controller.login)
router.post('/google', controller.googleLoginRegister)
router.get('/google', controller.googleAuth)
router.get('/google/callback', controller.googleAuthCallback)
router.post('/forgot-password', controller.forgotPassword)
router.post('/reset-password', controller.resetPassword)
router.post('/refresh-token', controller.refreshToken)

router.use(authMiddleware)
router.post('/send-verification-email', controller.sendVerificationEmail)
router.post('/verify-email', controller.verifyEmail)
router.put('/change-password', controller.changePassword)
export default router