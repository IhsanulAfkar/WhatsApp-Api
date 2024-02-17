import { Router } from "express"
import * as controller from '../controllers/order'
import { deviceMiddleware } from "../middleware/checker"
const router = Router()
router.post('/create', controller.createOrder)
router.get('/', controller.getAllOrders)
router.get('/:deviceId/:orderId', deviceMiddleware, controller.getOrder)
router.patch('/:deviceId/:orderId', deviceMiddleware, controller.changeOrderStatus)
export default router