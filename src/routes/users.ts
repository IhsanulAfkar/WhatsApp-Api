import { Router } from "express"
import * as controller from '../controllers/user'
const router = Router()
router.get('/', controller.getUser)
router.put('/', controller.editUser)

export default router