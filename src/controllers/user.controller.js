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
        throw new errorHandler(500, "Something went wrong while generating token!")
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
        throw new errorHandler(400, "Full Name is required!");
    } else if (email === "" || email === undefined || email === null) {
        throw new errorHandler(400, "Email is required!");
    } else if (userName === "" || userName === undefined || userName === null) {
        throw new errorHandler(400, "Username is required!");
    } else if (password === "" || password === undefined || password === null) {
        throw new errorHandler(400, "Password is required!");
    }

    const existingEmailUser = await User.findOne({ email: email });
    if (existingEmailUser) {
        throw new errorHandler(409, `${email} already exists`);
    }

    const existingUsernameUser = await User.findOne({ userName: userName });
    if (existingUsernameUser) {
        throw new errorHandler(409, `${userName} already exists`);
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

    // console.log("avatar.url", avatar.url);
    // console.log("coverImage.url", coverImage.url);


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
        throw new errorHandler(500, "Internal Server Error");
    }

    return res.status(201).json(
        new responseHandler(200, createdUser, "User registered successfully!")
    )

})

module.exports = { generateAccessAndRefreshToken, registerUser };