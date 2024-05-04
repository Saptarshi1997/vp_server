const express = require('express');
const videoController = require('../controllers/video.controller');
const verifyJWT = require('../middlewares/auth.middleware');
const upload = require('../middlewares/fileUpload.middleware');

const router = express.Router();

router.route("/uploadVideo").post(
    upload.fields([
        { name: 'thumbnail', maxCount: 1 },
        { name: 'videoFile', maxCount: 1 },
    ]),
    verifyJWT,
    videoController.publishAVideo
);

router.route("/getAllVideos").post(
    verifyJWT,
    videoController.getAllVideos
);

module.exports = router;