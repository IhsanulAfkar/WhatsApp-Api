import { Router } from "express";
import * as controller from '../controllers/auth'
import { validate } from "../middleware/validator";
import { registerValidator } from "../middleware/listValidator";
const router = Router()
router.post('/register', registerValidator, validate, controller.register)
router.post('/login', controller.login)
export default router