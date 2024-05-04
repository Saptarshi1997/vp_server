const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
const asyncHandler = require("../utils/asyncHandler");
const errorHandler = require("../utils/errorHandler");



const verifyJWT = asyncHandler(async (req, res, next) => {
    try {
        console.log("accessToken::::=====beforeeee>>>", req);

        const accessToken = req.cookies.accessToken || req.header("Authorization")?.replace("Bearer ", "");
        console.log("accessToken::::=====", accessToken);

        if (!accessToken) {
            return res.json(new responseHandler(400, {}, "Unauthorized token!"))
        }
        const decodedToken = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);

        const user = await User.findById(decodedToken?._id).select("-password -refreshToken")

        if (!user) {
            return res.json(new responseHandler(400, {}, "Invalid token!"))
        };

        req.user = user;
        next();
    } catch (error) {
        return res.json(new responseHandler(400, {}, "Invalid access token!"))
    }
})

module.exports = verifyJWT