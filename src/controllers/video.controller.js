const asyncHandler = require("../utils/asyncHandler");
const responseHandler = require("../utils/responseHandler");
const { uploadToCloudinary } = require("../utils/fileUpload");
const Video = require("../models/video.model");

const publishAVideo = asyncHandler(async (req, res) => {
    // get video file and the details from frontend
    // save the video and details to database

    const { title, description } = req.body;

    if (!title || !description) {
        return res.json(new responseHandler(400, {}, "Please fill all the required fields!"))
    }

    const videoFileLocalPath = req.files?.videoFile[0]?.path;
    const thumbnailLocalPath = req.files?.thumbnail[0]?.path;

    const thumbnail = await uploadToCloudinary(thumbnailLocalPath, "image");
    const videoFile = await uploadToCloudinary(videoFileLocalPath, "video");

    if (!thumbnail) {
        return res.json(new responseHandler(400, {}, "Failed to upload Thumbnail!"))
    }
    if (!videoFile) {
        return res.json(new responseHandler(400, {}, "Failed to upload Video!"))
    }

    const videoDuration = videoFile?.duration;

    const video = await Video.create({
        title,
        description,
        videoFile: videoFile.secure_url,
        thumbnail: thumbnail.secure_url,
        duration: videoDuration,
        owner: req.user?._id,
    });

    return res.json(new responseHandler(201, video, "Video published successfully"));
})

module.exports = { publishAVideo }