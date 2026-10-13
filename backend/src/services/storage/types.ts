export interface FileUploadInput {
  buffer: Buffer;
  originalname: string;
  mimetype: string;
  size: number;
}

export interface FileUploadResult {
  url: string;
  provider: 'local' | 'cloudinary' | 's3';
  publicId?: string;
  mimeType: string;
  sizeBytes: number;
  filename: string;
}

export interface IStorageProvider {
  uploadFile(file: FileUploadInput): Promise<FileUploadResult>;
  deleteFile(publicIdOrUrl: string): Promise<boolean>;
  getFileUrl(publicIdOrFilename: string): string;
  validateFile(file: FileUploadInput): { valid: boolean; error?: string };
}
