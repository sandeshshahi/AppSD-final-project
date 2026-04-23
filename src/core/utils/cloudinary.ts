import { v2 as cloudinary } from "cloudinary";
import streamifier from "streamifier";

console.log("====== CLOUDINARY BOOTUP CHECK ======");
console.log("API KEY EXISTS:", process.env.CLOUDINARY_API_KEY ? "YES" : "NO");
console.log("=====================================");

export const uploadToCloudinary = (fileBuffer: Buffer): Promise<any> => {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

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
