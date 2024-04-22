const express = require('express');
const userController = require('../controllers/user.controller');
const upload = require('../middlewares/fileUpload.middleware');

const router = express.Router();

router.route("/register").post(
    upload.fields([
        { name: 'avatar', maxCount: 1 },
        { name: 'coverImage', maxCount: 1 },
    ]),
    userController.registerUser
);

module.exports = router;