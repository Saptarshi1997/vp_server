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

    if (fullName === null || fullName === undefined || fullName === "") {
        return res.json(new responseHandler(400, {}, "Full name is required!"))
    } else if (email === null || email === undefined || email === "") {
        return res.json(new responseHandler(400, {}, "Email is required!"))
    } else if (userName === null || userName === undefined || userName === "") {
        return res.json(new responseHandler(400, {}, "User name is required!"))
    } else if (password === null || password === undefined || password === "") {
        return res.json(new responseHandler(400, {}, "Password is required!"))
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

const loginUser = asyncHandler(async (req, res) => {
    // take user credential
    // check whether user is registered or not
    // if registered, check the given password and existing password is same or not
    // generate access token and refresh token
    // give response with the user object

    const { email, password } = req.body;

    if (email === null || email === undefined || email === "") {
        return res.json(new responseHandler(400, {}, "Email is required!"))
    }

    const user = await User.findOne({ email: email });

    if (!user) {
        return res.json(new responseHandler(400, {}, `${email} is not registered with us`))
    }

    const isPasswordValid = await user.isPasswordCorrect(password);

    if (!isPasswordValid) {
        return res.json(new responseHandler(400, {}, "Wrong password!"))
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);

    const loggedInUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    const options = {
        httpOnly: true,
        secure: true,
    }

    return res.cookie("accessToken", accessToken, options).cookie("refreshToken", refreshToken, options).json(
        new responseHandler(200, { user: loggedInUser, refreshToken: refreshToken, accessToken: accessToken }, "User logged in successfully!")
    )
})

const logoutUser = asyncHandler(async (req, res) => {
    // remove access token and refresh token
    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: { refreshToken: undefined }
        },
        { new: true }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res.clearCookie("accessToken", options).clearCookie("refreshToken", options).json(
        new responseHandler(200, "User logged out successfully!")
    )
})

const changePassword = asyncHandler(async (req, res) => {
    // get user current password and new password
    // check whether the current password is same with the exisiting password
    // if same, update the exisiting password with new password
    // remove access token and refresh token and logout

    const { currentPassword, newPassword } = req.body;

    if (currentPassword === null || currentPassword === undefined || currentPassword === "") {
        return res.json(new responseHandler(400, {}, "Current password is required!"))
    } else if (newPassword === null || newPassword === undefined || newPassword === "") {
        return res.json(new responseHandler(400, {}, "New password is required!"))
    }

    const user = await User.findOne(req.user._id);

    const isPasswordValid = await user.isPasswordCorrect(currentPassword);

    if (!isPasswordValid) {
        return res.json(new responseHandler(400, {}, "Wrong current password!"))
    }

    const isNewPasswordSame = await user.isPasswordCorrect(newPassword);

    if (isNewPasswordSame) {
        return res.json(new responseHandler(400, {}, "New password should not be same of current password!"))
    }

    user.password = newPassword;
    user.refreshToken = undefined
    await user.save({ validateBeforeSave: false });

    const options = {
        httpOnly: true,
        secure: true
    }

    return res.clearCookie("accessToken", options).clearCookie("refreshToken", options).json(new responseHandler(200, {}, "Password changed successfully!"))
})


module.exports = { generateAccessAndRefreshToken, registerUser, loginUser, logoutUser, changePassword };