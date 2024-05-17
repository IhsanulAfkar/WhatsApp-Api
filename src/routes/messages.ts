import { Router } from "express"
import * as controller from '../controllers/messages'
const router = Router()
router.post('/:sessionId/send', controller.sendMessages)
router.post('/:sessionId/send/image', controller.sendImageMessages)
router.get('/:sessionId', controller.getConversationMessages);
router.get('/:sessionId/incoming', controller.getIncomingMessages)
router.get('/:sessionId/outgoing', controller.getOutgoingMessages)
router.get('/:sessionId/list', controller.getMessengerList)
export default router