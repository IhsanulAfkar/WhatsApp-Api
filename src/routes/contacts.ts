import { Router } from "express"
import * as controller from '../controllers/contact'

const router = Router()
router.post('/create', controller.createContact)
router.get('/', controller.getAllContacts)
router.get('/:contactId', controller.getContact)
router.put('/:contactId', controller.updateContact);
router.delete('/', controller.deleteContacts);
export default router