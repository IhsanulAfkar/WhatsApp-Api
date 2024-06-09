import * as controller from '../controllers/broadcast'
import { Router } from 'express';
const router = Router();

router.post('/', controller.createBroadcast);
router.get('/', controller.getAllBroadcasts);
router.get('/:broadcastId', controller.getBroadcast);
router.get('/:broadcastId/outgoing', controller.getOutgoingBroadcasts);
router.put('/:id', controller.updateBroadcast);
router.patch('/:id/status', controller.updateBroadcastStatus);
router.delete('/', controller.deleteBroadcasts);

export default router