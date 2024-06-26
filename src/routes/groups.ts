import { Router } from 'express';
import * as controller from '../controllers/group';

const router = Router();

router.get('/', controller.getGroups);
router.post('/', controller.createGroup);
router.get('/:groupId', controller.getGroup);
router.patch('/:groupId', controller.updatedGroup);
router.post('/add', controller.addMemberToGroup);
router.delete('/remove', controller.removeMembersFromGroup);
router.delete('/', controller.deleteGroups);

export default router;
