const cloudinary = require("cloudinary").v2;
const fs = require("fs");


cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
});


const uploadToCloudinary = async (localFilePath, resourceType) => {
    console.log("cloud_name ::: api_key ::: api_secret-------", process.env.CLOUDINARY_CLOUD_NAME, process.env.CLOUDINARY_API_KEY, process.env.CLOUDINARY_API_SECRET);
    console.log("localpaththththth-------", localFilePath);
    console.log("resourcetypepepep-------", resourceType);

    try {
        if (!localFilePath) {
            return null
        }

        console.log("before cloudinary response-------");
        const response = await cloudinary.uploader.upload(localFilePath, { resource_type: resourceType });
        console.log("after cloudinary response-------");

        fs.unlinkSync(localFilePath);
        return response;
    } catch (error) {
        console.log("catch part ::::: cloudinary response-------", error);
        fs.unlinkSync(localFilePath);
        return null;
    }
}

const deleteFileFromCloudinary = async (url, isVideo) => {
    try {
        if (!url) {
            return; // Exit the function if url is not provided
        }
        const publicId = url.split("/").pop().split(".")[0]; // Extract the public ID

        // Set the resource type based on the asset type
        const resourceType = isVideo ? 'video' : 'image';

        // Use Cloudinary's destroy method to delete the asset
        await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });

        console.log(`File ${url} deleted from Cloudinary`);
    } catch (error) {
        console.error(`Error deleting file from Cloudinary: ${error.message}`);
        throw error;
    }
};

module.exports = { uploadToCloudinary, deleteFileFromCloudinary };