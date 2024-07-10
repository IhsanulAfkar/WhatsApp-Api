import { Router } from "express"
import * as controller from '../controllers/product'
const router = Router()
router.get('/', controller.getAllProducts)
router.get('/:productId', controller.getProduct)
router.put('/:productId/edit', controller.editProduct)
router.patch('/:productId/amount', controller.changeAmount)
export default router