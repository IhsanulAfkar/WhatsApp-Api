import { Router } from "express"
import * as controller from '../controllers/product'
const router = Router()
router.get('/', controller.getAllProducts)
router.post('/create', controller.createProduct)
export default router