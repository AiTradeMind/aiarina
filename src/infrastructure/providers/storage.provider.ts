import {
  IStorageProvider,
  StorageObjectMetadata
} from '../abstractions';
import logger from '../../lib/logger';

export class EnterpriseStorageProvider implements IStorageProvider {
  readonly providerId = 'enterprise-storage-default';

  private inMemoryStore = new Map<string, { data: Buffer; metadata: StorageObjectMetadata }>();

  async uploadObject(
    key: string,
    data: Buffer | Uint8Array | string,
    mimeType: string = 'application/octet-stream'
  ): Promise<string> {
    const buffer = typeof data === 'string' ? Buffer.from(data) : Buffer.from(data);
    const metadata: StorageObjectMetadata = {
      key,
      sizeBytes: buffer.length,
      mimeType,
      lastModified: new Date()
    };

    this.inMemoryStore.set(key, { data: buffer, metadata });
    logger.info({ key, sizeBytes: buffer.length }, 'Object uploaded to storage');
    return `/storage/${key}`;
  }

  async downloadObject(key: string): Promise<Buffer> {
    const item = this.inMemoryStore.get(key);
    if (!item) {
      throw new Error(`Storage object key not found: ${key}`);
    }
    return item.data;
  }

  async deleteObject(key: string): Promise<boolean> {
    const deleted = this.inMemoryStore.delete(key);
    if (deleted) {
      logger.info({ key }, 'Object deleted from storage');
    }
    return deleted;
  }

  async getObjectMetadata(key: string): Promise<StorageObjectMetadata | null> {
    const item = this.inMemoryStore.get(key);
    return item ? item.metadata : null;
  }

  async getSignedUrl(key: string, expiresInSeconds: number): Promise<string> {
    const expiresAt = Date.now() + expiresInSeconds * 1000;
    return `https://storage.ai-arina.enterprise/signed/${encodeURIComponent(key)}?expires=${expiresAt}&sig=signed_token_v1`;
  }

  async healthCheck(): Promise<{ isHealthy: boolean }> {
    return { isHealthy: true };
  }
}
