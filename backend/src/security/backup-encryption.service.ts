import crypto from 'crypto';
import fs from 'fs';
import { promisify } from 'util';
import { pipeline } from 'stream';
import { createGzip, createGunzip } from 'zlib';

const pipelineAsync = promisify(pipeline);

/**
 * Encrypted Backup System
 * AES-256 encryption for backup files
 */
export class BackupEncryptionService {
  private readonly algorithm = 'aes-256-cbc';
  private readonly keyLength = 32;
  private readonly ivLength = 16;
  private backupKey: Buffer;

  constructor(backupKeyHex?: string) {
    if (backupKeyHex) {
      this.backupKey = Buffer.from(backupKeyHex, 'hex');
    } else {
      this.backupKey = crypto.randomBytes(this.keyLength);
    }
  }

  /**
   * Encrypt backup file
   */
  async encryptBackup(inputPath: string, outputPath: string): Promise<void> {
    const iv = crypto.randomBytes(this.ivLength);
    const cipher = crypto.createCipheriv(this.algorithm, this.backupKey, iv);

    // Write IV to the beginning of the file
    await fs.promises.writeFile(outputPath, iv);

    // Encrypt and compress
    await pipelineAsync(
      fs.createReadStream(inputPath),
      createGzip(),
      cipher,
      fs.createWriteStream(outputPath, { flags: 'a' })
    );
  }

  /**
   * Decrypt backup file
   */
  async decryptBackup(inputPath: string, outputPath: string): Promise<void> {
    // Read IV from the beginning of the file
    const fileHandle = await fs.promises.open(inputPath, 'r');
    const iv = Buffer.alloc(this.ivLength);
    await fileHandle.read(iv, 0, this.ivLength, 0);
    await fileHandle.close();

    const decipher = crypto.createDecipheriv(this.algorithm, this.backupKey, iv);

    // Decrypt and decompress
    await pipelineAsync(
      fs.createReadStream(inputPath, { start: this.ivLength }),
      decipher,
      createGunzip(),
      fs.createWriteStream(outputPath)
    );
  }

  /**
   * Generate backup checksum
   */
  async generateChecksum(filePath: string): Promise<string> {
    const hash = crypto.createHash('sha256');
    await pipelineAsync(
      fs.createReadStream(filePath),
      hash
    );
    return hash.digest('hex');
  }

  /**
   * Verify backup integrity
   */
  async verifyBackup(filePath: string, expectedChecksum: string): Promise<boolean> {
    const actualChecksum = await this.generateChecksum(filePath);
    return actualChecksum === expectedChecksum;
  }
}

export default new BackupEncryptionService(process.env.BACKUP_ENCRYPTION_KEY);
