import * as fs from 'fs';
import * as path from 'path';
import { logger } from '../utils/logger';

export interface CloudStorageConfig {
    provider: 'local' | 's3' | 'azure' | 'gcs';
    bucket?: string;
    path?: string;
    region?: string;
}

export interface UploadResult {
    success: boolean;
    url?: string;
    error?: string;
}

export class CloudStorageService {
    private config: CloudStorageConfig;

    constructor(config?: CloudStorageConfig) {
        this.config = config || {
            provider: (process.env.CLOUD_STORAGE_PROVIDER as any) || 'local',
            bucket: process.env.CLOUD_STORAGE_BUCKET,
            path: process.env.CLOUD_STORAGE_PATH || 'exports',
            region: process.env.CLOUD_STORAGE_REGION || 'me-south-1'
        };
    }

    /**
     * Upload file to configured cloud storage
     */
    async uploadFile(localPath: string, remoteName: string): Promise<UploadResult> {
        try {
            switch (this.config.provider) {
                case 's3':
                    return await this.uploadToS3(localPath, remoteName);
                case 'azure':
                    return await this.uploadToAzure(localPath, remoteName);
                case 'gcs':
                    return await this.uploadToGCS(localPath, remoteName);
                case 'local':
                    return { success: true, url: localPath };
                default:
                    throw new Error(`Unknown storage provider: ${this.config.provider}`);
            }
        } catch (error: any) {
            logger.error('Cloud storage upload failed:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Upload to AWS S3
     */
    private async uploadToS3(localPath: string, remoteName: string): Promise<UploadResult> {
        try {
            // Check if AWS SDK is installed
            const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');

            const s3Client = new S3Client({
                region: this.config.region || 'me-south-1',
                credentials: {
                    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
                    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
                }
            });

            const fileStream = fs.createReadStream(localPath);
            const key = `${this.config.path}/${remoteName}`;

            const command = new PutObjectCommand({
                Bucket: this.config.bucket!,
                Key: key,
                Body: fileStream,
                ContentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                ServerSideEncryption: 'AES256'
            });

            await s3Client.send(command);

            const url = `https://${this.config.bucket}.s3.${this.config.region}.amazonaws.com/${key}`;
            logger.info(`File uploaded to S3: ${url}`);

            return { success: true, url };
        } catch (error: any) {
            if (error.code === 'MODULE_NOT_FOUND') {
                logger.error('AWS SDK not installed. Run: npm install @aws-sdk/client-s3');
                return {
                    success: false,
                    error: 'AWS SDK not installed. Run: npm install @aws-sdk/client-s3'
                };
            }
            throw error;
        }
    }

    /**
     * Upload to Azure Blob Storage
     */
    private async uploadToAzure(localPath: string, remoteName: string): Promise<UploadResult> {
        try {
            const { BlobServiceClient } = require('@azure/storage-blob');

            const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
            if (!connectionString) {
                throw new Error('AZURE_STORAGE_CONNECTION_STRING not configured');
            }

            const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
            const containerClient = blobServiceClient.getContainerClient(this.config.bucket!);

            // Create container if it doesn't exist
            await containerClient.createIfNotExists();

            const blobName = `${this.config.path}/${remoteName}`;
            const blockBlobClient = containerClient.getBlockBlobClient(blobName);

            await blockBlobClient.uploadFile(localPath, {
                blobHTTPHeaders: {
                    blobContentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                }
            });

            const url = blockBlobClient.url;
            logger.info(`File uploaded to Azure: ${url}`);

            return { success: true, url };
        } catch (error: any) {
            if (error.code === 'MODULE_NOT_FOUND') {
                logger.error('Azure SDK not installed. Run: npm install @azure/storage-blob');
                return {
                    success: false,
                    error: 'Azure SDK not installed. Run: npm install @azure/storage-blob'
                };
            }
            throw error;
        }
    }

    /**
     * Upload to Google Cloud Storage
     */
    private async uploadToGCS(localPath: string, remoteName: string): Promise<UploadResult> {
        try {
            const { Storage } = require('@google-cloud/storage');

            const storage = new Storage({
                keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS
            });

            const bucket = storage.bucket(this.config.bucket!);
            const destination = `${this.config.path}/${remoteName}`;

            await bucket.upload(localPath, {
                destination,
                metadata: {
                    contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                }
            });

            const url = `https://storage.googleapis.com/${this.config.bucket}/${destination}`;
            logger.info(`File uploaded to GCS: ${url}`);

            return { success: true, url };
        } catch (error: any) {
            if (error.code === 'MODULE_NOT_FOUND') {
                logger.error('GCS SDK not installed. Run: npm install @google-cloud/storage');
                return {
                    success: false,
                    error: 'GCS SDK not installed. Run: npm install @google-cloud/storage'
                };
            }
            throw error;
        }
    }

    /**
     * Delete file from cloud storage
     */
    async deleteFile(remoteName: string): Promise<boolean> {
        try {
            switch (this.config.provider) {
                case 's3':
                    return await this.deleteFromS3(remoteName);
                case 'azure':
                    return await this.deleteFromAzure(remoteName);
                case 'gcs':
                    return await this.deleteFromGCS(remoteName);
                case 'local':
                    return true;
                default:
                    return false;
            }
        } catch (error: any) {
            logger.error('Cloud storage delete failed:', error);
            return false;
        }
    }

    private async deleteFromS3(remoteName: string): Promise<boolean> {
        const { S3Client, DeleteObjectCommand } = require('@aws-sdk/client-s3');

        const s3Client = new S3Client({
            region: this.config.region,
            credentials: {
                accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
            }
        });

        const command = new DeleteObjectCommand({
            Bucket: this.config.bucket!,
            Key: `${this.config.path}/${remoteName}`
        });

        await s3Client.send(command);
        return true;
    }

    private async deleteFromAzure(remoteName: string): Promise<boolean> {
        const { BlobServiceClient } = require('@azure/storage-blob');

        const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
        const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString!);
        const containerClient = blobServiceClient.getContainerClient(this.config.bucket!);
        const blockBlobClient = containerClient.getBlockBlobClient(`${this.config.path}/${remoteName}`);

        await blockBlobClient.delete();
        return true;
    }

    private async deleteFromGCS(remoteName: string): Promise<boolean> {
        const { Storage } = require('@google-cloud/storage');

        const storage = new Storage({
            keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS
        });

        await storage.bucket(this.config.bucket!).file(`${this.config.path}/${remoteName}`).delete();
        return true;
    }
}
