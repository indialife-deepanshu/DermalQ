import cloudinary from '../config/cloudinary.js';

export const uploadToCloudinary = (fileBuffer) => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            { folder: "skin_reports" }, // Organizes your Yukti project files
            (error, result) => {
                if (error) return reject(error);
                resolve(result.secure_url); // This is the URL we save to the DB
            }
        );
        uploadStream.end(fileBuffer);
    });
};