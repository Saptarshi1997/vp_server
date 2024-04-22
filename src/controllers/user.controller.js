const User = require("../models/user.model");
const errorHandler = require("../utils/errorHandler");

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

module.exports = generateAccessAndRefreshToken;