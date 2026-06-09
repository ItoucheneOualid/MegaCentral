"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const debugController_1 = require("../controllers/debugController");
const router = (0, express_1.Router)();
// Routes de debug
router.get('/tables', debugController_1.DebugController.listTables);
router.get('/users', debugController_1.DebugController.getUsers);
router.get('/users-structure', debugController_1.DebugController.getUsersTableStructure);
router.post('/create-user', debugController_1.DebugController.createTestUser);
router.post('/create-plain-user', debugController_1.DebugController.createPlainUser);
router.post('/update-password', debugController_1.DebugController.updateUserPassword);
router.post('/check-user', debugController_1.DebugController.checkUser);
router.post('/test-bcrypt', debugController_1.DebugController.testBcrypt);
router.post('/fix-password-field', debugController_1.DebugController.fixPasswordField);
router.post('/delete-user', debugController_1.DebugController.deleteUser);
router.get('/table/:tableName', debugController_1.DebugController.testTable);
exports.default = router;
