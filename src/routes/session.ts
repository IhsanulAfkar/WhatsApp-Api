import { Router } from "express"
import * as controller from '../controllers/session'
const router = Router()
router.post('/create', controller.createSession)
router.get('/', controller.getAllSessions)
export default router