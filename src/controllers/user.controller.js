const User = require("../models/user.model");
const errorHandler = require("../utils/errorHandler");
const asyncHandler = require("../utils/asyncHandler");
const responseHandler = require("../utils/responseHandler");
const { uploadToCloudinary } = require("../utils/fileUpload");

const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId);

        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };

    } catch (error) {
        return res.json(new responseHandler(400, {}, "Something went wrong when generating token!"))
    }
}

const registerUser = asyncHandler(async (req, res) => {
    // get user details from frontend
    // empty validation
    // check if user already exists - email, userName
    // check for images & avatar
    // upload them to cloudinary
    // create user object and entry that in db
    // create password and refresh token field from response
    // check for user creation
    // return response

    const { fullName, email, userName, password } = req.body;

    if (fullName === "" || fullName === undefined || fullName === null) {
        return res.json(new responseHandler(400, {}, "Full name is missing!"))
    } else if (email === "" || email === undefined || email === null) {
        return res.json(new responseHandler(400, {}, "Email is missing!"))
    } else if (userName === "" || userName === undefined || userName === null) {
        return res.json(new responseHandler(400, {}, "User name is missing!"))
    } else if (password === "" || password === undefined || password === null) {
        return res.json(new responseHandler(400, {}, "Password is missing!"))
    }

    const existingEmailUser = await User.findOne({ email: email });
    if (existingEmailUser) {
        return res.json(new responseHandler(400, {}, "Email already exists!"))
    }

    const existingUsernameUser = await User.findOne({ userName: userName });
    if (existingUsernameUser) {
        return res.json(new responseHandler(400, {}, "User name is missing!"))
    }

    let avatarLocalPath;
    let coverImageLocalPath;

    if (req.files && Array.isArray(req.files.avatar) && req.files.avatar.length > 0) {
        avatarLocalPath = req.files.avatar[0].path;
    }

    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path;
    }


    let avatar = await uploadToCloudinary(avatarLocalPath, "image");
    let coverImage = await uploadToCloudinary(coverImageLocalPath, "image");

    let user = await User.create({
        fullName,
        userName: userName.toLowerCase(),
        email,
        password,
        avatar: avatar?.url || "",
        coverImage: coverImage?.url || "",
    });

    let createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    if (!createdUser) {
        return res.json(new responseHandler(500, {}, "Internal server error!"))
    }

    return res.json(new responseHandler(200, createdUser, "User registered successfully!"))

})

module.exports = { generateAccessAndRefreshToken, registerUser };