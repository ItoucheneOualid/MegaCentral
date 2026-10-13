import { Router } from 'express';
import { DebugController } from '../controllers/debugController';

const router = Router();

// Routes de debug
router.get('/tables', DebugController.listTables);
router.get('/users', DebugController.getUsers);
router.get('/users-structure', DebugController.getUsersTableStructure);
router.post('/create-user', DebugController.createTestUser);
router.post('/update-password', DebugController.updateUserPassword);
router.post('/check-user', DebugController.checkUser);
router.post('/test-bcrypt', DebugController.testBcrypt);
router.post('/delete-user', DebugController.deleteUser);
router.get('/table/:tableName', DebugController.testTable);

export default router;
