import { Router } from "express";
import * as controller from '../controllers/campaign'
import { deviceMiddleware } from "../middleware/checker";
const router = Router()
router.post('/', deviceMiddleware, controller.createCampaign);
router.get('/', controller.getAllCampaigns);
router.get('/:campaignId', controller.getCampaign);
router.get('/:campaignId/outgoing', controller.getOutgoingCampaigns);
router.put('/:campaignId', controller.updateCampaign);
router.patch('/:campaignId/status', controller.updateCampaignStatus);
router.delete('/', controller.deleteCampaigns);
router.post('/messages/', controller.createCampaignMessage);
router.get('/:campaignId/messages/', controller.getAllCampaignMessages);
router.get('/messages/:campaignMessageId', controller.getCampaignMessage);
router.get('/messages/:campaignMessageId/outgoing', controller.getOutgoingCampaignMessages);
router.put('/messages/:campaignMessageId', controller.updateCampaignMessage);
router.patch('/messages/:campaignMessageId/status', controller.updateCampaignMessageStatus);
router.delete('/messages/', controller.deleteCampaignMessages);
export default router