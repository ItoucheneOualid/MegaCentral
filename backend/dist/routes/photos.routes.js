"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const photos_controller_1 = require("../controllers/photos.controller");
const router = (0, express_1.Router)();
// Ajouter une photo à un article
router.post('/articles/:id/photo', photos_controller_1.addPhotoToArticle);
exports.default = router;
