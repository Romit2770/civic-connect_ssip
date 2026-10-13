import { v2 as cloudinary } from 'cloudinary';
import { FileUploadInput, FileUploadResult, IStorageProvider } from './types';
import { env } from '../../config/env';

export class CloudinaryProvider implements IStorageProvider {
  constructor() {
    if (env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET) {
      cloudinary.config({
        cloud_name: env.CLOUDINARY_CLOUD_NAME,
        api_key: env.CLOUDINARY_API_KEY,
        api_secret: env.CLOUDINARY_API_SECRET,
      });
    }
  }

  validateFile(file: FileUploadInput): { valid: boolean; error?: string } {
    const isAudio = file.mimetype.startsWith('audio/');
    const maxMb = isAudio ? env.MAX_AUDIO_SIZE_MB : env.MAX_IMAGE_SIZE_MB;
    if (file.size > maxMb * 1024 * 1024) {
      return { valid: false, error: `File size exceeds ${maxMb}MB limit` };
    }
    return { valid: true };
  }

  async uploadFile(file: FileUploadInput): Promise<FileUploadResult> {
    const validation = this.validateFile(file);
    if (!validation.valid) {
      throw new Error(validation.error || 'Invalid file');
    }

    const isAudio = file.mimetype.startsWith('audio/');
    const resourceType = isAudio ? 'video' : 'image'; // Cloudinary uses 'video' for audio files

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'civicconnect',
          resource_type: resourceType,
        },
        (error, result) => {
          if (error || !result) {
            return reject(error || new Error('Cloudinary upload failed'));
          }
          resolve({
            url: result.secure_url,
            provider: 'cloudinary',
            publicId: result.public_id,
            mimeType: file.mimetype,
            sizeBytes: result.bytes || file.size,
            filename: result.original_filename || file.originalname,
          });
        }
      );

      uploadStream.end(file.buffer);
    });
  }

  async deleteFile(publicId: string): Promise<boolean> {
    try {
      const res = await cloudinary.uploader.destroy(publicId);
      return res.result === 'ok';
    } catch (e) {
      console.warn('Cloudinary delete error:', e);
      return false;
    }
  }

  getFileUrl(publicId: string): string {
    return cloudinary.url(publicId, { secure: true });
  }
}
