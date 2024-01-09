import { Router } from "express"
import * as controller from '../controllers/order'
const router = Router()
router.post('/:sessionId/send', controller.sendMessages)

export default router