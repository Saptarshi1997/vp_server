const express = require('express');
const userController = require('../controllers/user.controller');
const verifyJWT = require('../middlewares/auth.middleware');
const upload = require('../middlewares/fileUpload.middleware');

const router = express.Router();

router.route("/register").post(
    upload.fields([
        { name: 'avatar', maxCount: 1 },
        { name: 'coverImage', maxCount: 1 },
    ]),
    userController.registerUser
);

router.route("/login").post(
    userController.loginUser
);

router.route("/logout").post(
    verifyJWT,
    userController.logoutUser
);

router.route("/changePassword").post(
    verifyJWT,
    userController.changePassword
);

module.exports = router;