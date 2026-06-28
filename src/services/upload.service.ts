import { v2 as cloudinary } from 'cloudinary';
import { ApiError } from '../utils/ApiError';
import { config } from '../config';

if (config.cloudinaryUrl) {
  cloudinary.config({ secure: true });
}

export class UploadService {
  async uploadFile(file: Express.Multer.File) {
    if (!config.cloudinaryUrl) {
      throw new ApiError(503, 'Cloudinary is not configured');
    }

    return new Promise<{ url: string; publicId: string; format: string }>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'studyhub',
          resource_type: 'auto',
        },
        (error, result) => {
          if (error || !result) {
            reject(new ApiError(500, `Upload failed: ${error?.message || 'Unknown error'}`));
            return;
          }
          resolve({
            url: result.secure_url,
            publicId: result.public_id,
            format: result.format || 'unknown',
          });
        }
      );

      uploadStream.end(file.buffer);
    });
  }
}

export const uploadService = new UploadService();
