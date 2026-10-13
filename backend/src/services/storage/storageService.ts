import { env } from '../../config/env';
import { CloudinaryProvider } from './CloudinaryProvider';
import { LocalStorageProvider } from './LocalStorageProvider';
import { FileUploadInput, FileUploadResult, IStorageProvider } from './types';

export class StorageService implements IStorageProvider {
  private provider: IStorageProvider;

  constructor() {
    if (
      env.STORAGE_PROVIDER === 'cloudinary' &&
      env.CLOUDINARY_CLOUD_NAME &&
      env.CLOUDINARY_API_KEY
    ) {
      this.provider = new CloudinaryProvider();
    } else {
      this.provider = new LocalStorageProvider();
    }
  }

  async uploadFile(file: FileUploadInput): Promise<FileUploadResult> {
    return this.provider.uploadFile(file);
  }

  // Alias for convenient usage
  async upload(file: FileUploadInput): Promise<FileUploadResult> {
    return this.uploadFile(file);
  }

  async deleteFile(publicIdOrUrl: string): Promise<boolean> {
    return this.provider.deleteFile(publicIdOrUrl);
  }

  getFileUrl(publicIdOrFilename: string): string {
    return this.provider.getFileUrl(publicIdOrFilename);
  }

  validateFile(file: FileUploadInput): { valid: boolean; error?: string } {
    return this.provider.validateFile(file);
  }
}

export const storageService = new StorageService();
export * from './types';
