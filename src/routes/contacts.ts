import { Router } from "express"
import * as controller from '../controllers/contact'

const router = Router()
router.post('/create', controller.createContact)
router.get('/', controller.getAllContacts)
export default router