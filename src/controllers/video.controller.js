const asyncHandler = require("../utils/asyncHandler");
const responseHandler = require("../utils/responseHandler");
const { uploadToCloudinary } = require("../utils/fileUpload");
const Video = require("../models/video.model");
const User = require("../models/user.model");

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

    // const user = await User.findById(req.user?._id).select(
    //     "-password -createdAt -updatedAt"
    // );

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

const getAllVideos = asyncHandler(async (req, res) => {
    // get queries like pageNum, limit, sort etc from frontend
    // 

    const { pageNum = 1, limit = 10, query, sortBy, sortType } = req.body;
    const userId = req.user?._id;
    // Prepare the options for pagination
    const options = {
        pageNum: parseInt(pageNum),
        limit: parseInt(limit),
        sort: sortBy ? { [sortBy]: sortType === "desc" ? -1 : 1 } : { createdAt: -1 },
    };

    // Prepare the conditions for filtering
    const conditions = {};
    if (query) {
        // Add conditions for searching by title, description, etc.
        conditions.title = { $regex: query, $options: "i" }; // Case-insensitive search for title
        // You can add conditions for other fields similarly
        // For example:
        conditions.description = { $regex: query, $options: "i" }; // Case-insensitive search for description
    }
    if (userId) {
        conditions.owner = userId; // Filter videos by user ID
    }

    // Perform the database query
    const videos = await Video.aggregatePaginate(conditions, options);

    // Populate the owner field for each video
    await Video.populate(videos.docs, { path: 'owner', select: 'fullName username email avatar coverImage' });

    // for (let video of videos.docs) {
    //     const likes = await Like.find({ video: video._id }).populate(
    //         "likedBy",
    //         "fullName username"
    //     );
    //     video.likes = likes.map((like) => like.likedBy);

    //     // Populate 'owner' field
    //     const owner = await User.findById(video.owner).select("fullName username");
    //     video.owner = owner;
    // }

    // Return the paginated list of videos
    if (!videos) {
        console.log("error in fetching videos");
        return res.json(new responseHandler(400, {}, "Error in fetching videos!"))
    }

    return res.json(new responseHandler(200, videos, "videos fetched successfully"));
})

module.exports = { publishAVideo, getAllVideos }