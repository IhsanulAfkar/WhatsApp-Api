import { Router } from "express"
import * as controller from '../controllers/autoReply'

const router = Router()
router.post('/', controller.createAutoReplies)
// router.get('/', controller.getDevices)
export default router