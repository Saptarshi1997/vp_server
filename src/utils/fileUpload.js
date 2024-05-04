const cloudinary = require("cloudinary").v2;
const fs = require("fs");


cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
});


const uploadToCloudinary = async (localFilePath, resourceType) => {
    try {
        if (!localFilePath) {
            return null;
        }

        // Define chunk size (in bytes)
        const chunkSize = 5 * 1024 * 1024; // 5MB

        // Open a read stream for the local file
        const readStream = fs.createReadStream(localFilePath);

        // Get the total file size
        const stats = fs.statSync(localFilePath);
        const totalFileSize = stats.size;

        // Calculate the number of chunks
        const numberOfChunks = Math.ceil(totalFileSize / chunkSize);

        console.log("Total file size:", totalFileSize);
        console.log("Number of chunks:", numberOfChunks);

        // Upload options
        const options = {
            resource_type: resourceType,
            chunk_size: chunkSize,
            // eager: [{ width: 500, height: 500, crop: 'pad' }] // Optional, adjust as needed
        };

        // Perform the streaming upload
        let currentChunk = 1;
        readStream.on('data', (chunk) => {
            console.log(`Chunk ${currentChunk} size: ${chunk.length}`);
            currentChunk++;
        });

        const response = await new Promise((resolve, reject) => {
            readStream.pipe(
                cloudinary.uploader.upload_stream(options, (error, result) => {
                    if (error) {
                        reject(error);
                    } else {
                        console.log("result=-------+++++++", result)
                        resolve(result);
                    }
                })
            );
        });

        console.log("Response:", response);

        // Remove the local file after upload
        fs.unlinkSync(localFilePath);

        return response;
    } catch (error) {
        // Handle errors and cleanup
        fs.unlinkSync(localFilePath);
        console.error('Upload error:', error);
        return null;
    }
};

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