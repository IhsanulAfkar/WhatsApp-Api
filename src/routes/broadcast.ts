import * as controller from '../controllers/broadcast'
import { Router } from 'express';
import { deviceMiddleware } from '../middleware/checker';
const router = Router();

router.post('/', controller.createBroadcast);
router.get('/', controller.getAllBroadcasts);
router.get('/:broadcastId', controller.getBroadcast);
router.get('/:broadcastId/outgoing', controller.getOutgoingBroadcasts);
router.put('/:id', deviceMiddleware, controller.updateBroadcast);
router.patch('/:id/status', controller.updateBroadcastStatus);
router.delete('/', controller.deleteBroadcasts);

export default router