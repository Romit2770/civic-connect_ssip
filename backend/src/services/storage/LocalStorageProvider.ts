import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { FileUploadInput, FileUploadResult, IStorageProvider } from './types';
import { env } from '../../config/env';

export class LocalStorageProvider implements IStorageProvider {
  private uploadsDir: string;

  constructor() {
    this.uploadsDir = path.resolve(__dirname, '../../../uploads');
    if (!fs.existsSync(this.uploadsDir)) {
      fs.mkdirSync(this.uploadsDir, { recursive: true });
    }
  }

  validateFile(file: FileUploadInput): { valid: boolean; error?: string } {
    const isAudio = file.mimetype.startsWith('audio/');
    const isVideo = file.mimetype.startsWith('video/');
    let maxMb = env.MAX_IMAGE_SIZE_MB;
    if (isAudio) maxMb = env.MAX_AUDIO_SIZE_MB;
    if (isVideo) maxMb = env.MAX_VIDEO_SIZE_MB;

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

    const defaultExt = file.mimetype.startsWith('audio/')
      ? '.webm'
      : file.mimetype.startsWith('video/')
      ? '.mp4'
      : '.jpg';
    const ext = path.extname(file.originalname) || defaultExt;
    const safeName = `${Date.now()}-${uuidv4().substring(0, 8)}${ext}`;
    const targetPath = path.join(this.uploadsDir, safeName);

    await fs.promises.writeFile(targetPath, file.buffer);

    const fileUrl = `/uploads/${safeName}`;

    return {
      url: fileUrl,
      provider: 'local',
      publicId: safeName,
      mimeType: file.mimetype,
      sizeBytes: file.size,
      filename: safeName,
    };
  }

  async deleteFile(filename: string): Promise<boolean> {
    try {
      const cleanName = path.basename(filename);
      const filePath = path.join(this.uploadsDir, cleanName);
      if (fs.existsSync(filePath)) {
        await fs.promises.unlink(filePath);
        return true;
      }
      return false;
    } catch (e) {
      console.warn('Local storage delete error:', e);
      return false;
    }
  }

  getFileUrl(filename: string): string {
    return `/uploads/${path.basename(filename)}`;
  }
}
