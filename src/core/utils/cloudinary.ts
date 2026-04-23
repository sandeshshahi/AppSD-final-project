import "dotenv/config";
import { v2 as cloudinary } from "cloudinary";
import streamifier from "streamifier";

const cloudName =
  process.env.CLOUDINARY_CLOUD_NAME ?? process.env.CLOUDINARY_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY?.trim();
const apiSecret = process.env.CLOUDINARY_API_SECRET?.trim();

if (!cloudName || !apiKey || !apiSecret) {
  throw new Error(
    `Cloudinary env missing. cloud=${!!cloudName}, key=${!!apiKey}, secret=${!!apiSecret}`,
  );
}

cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
  secure: true,
});

export const uploadToCloudinary = (fileBuffer: Buffer): Promise<any> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: "dental_xrays" },
      (error, result) => {
        if (result) resolve(result);
        else reject(error);
      },
    );
    streamifier.createReadStream(fileBuffer).pipe(uploadStream);
  });
};
