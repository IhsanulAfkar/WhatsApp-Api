import { Router } from "express"
import * as controller from '../controllers/autoReply'

const router = Router()
router.patch('/status', controller.updateAutoReplyStatus)
router.get('/', controller.getAutoReply)
router.put('/', controller.editAutoReply)
router.get('/:deviceId/:phone', controller.getChatbotSession)
router.put('/:deviceId/:phone', controller.updateChatbotSession)
export default router