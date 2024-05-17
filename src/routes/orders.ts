import { Router } from "express"
import * as controller from '../controllers/order'
import { deviceMiddleware } from "../middleware/checker"
const router = Router()
router.post('/', controller.createOrder)
router.get('/', controller.getAllOrders)
router.get('/:orderId', deviceMiddleware, controller.getOrder)
router.patch('/:orderId', deviceMiddleware, controller.changeOrderStatus)
export default router