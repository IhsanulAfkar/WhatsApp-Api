import { Router } from "express"
import * as controller from '../controllers/device'

const router = Router()
router.post('/create', controller.create)
router.get('/', controller.getDevices)
router.get('/:deviceId', controller.getDevice)
router.delete('/', controller.deleteDevices)
export default router