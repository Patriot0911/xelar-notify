import { AppConfig } from '@libs/config';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const TAG_LENGTH = 16;
const ENCRYPTED_PREFIX = 'enc:';

@Injectable()
export class CryptoService {
  private readonly key: Buffer;
  private readonly ENCRYPTED_PREFIX = 'enc:';

  constructor(configService: ConfigService<AppConfig>) {
    const secret = configService.get<string>('ENCRYPTION_KEY');
    this.key = crypto.scryptSync(secret!, 'salt', 32);
  }

  private isEncrypted(value: string): boolean {
    return value.startsWith(this.ENCRYPTED_PREFIX);
  }

  encrypt(plaintext: string, skipEncryptionCheck: boolean = false): string {
    if (this.isEncrypted(plaintext) && !skipEncryptionCheck) {
      return plaintext;
    }
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, this.key, iv);

    const encrypted = Buffer.concat([
      cipher.update(plaintext, 'utf8'),
      cipher.final(),
    ]);

    const tag = cipher.getAuthTag();

    return ENCRYPTED_PREFIX + Buffer.concat([iv, tag, encrypted]).toString('base64');
  }

  decrypt(ciphertext: string, skipEncryptionCheck: boolean = false): string {
    if (!this.isEncrypted(ciphertext) && !skipEncryptionCheck) {
      return ciphertext;
    }

    const buffer = Buffer.from(
      ciphertext.slice(ENCRYPTED_PREFIX.length),
      'base64',
    );

    const iv = buffer.subarray(0, IV_LENGTH);
    const tag = buffer.subarray(IV_LENGTH, IV_LENGTH + TAG_LENGTH);
    const encrypted = buffer.subarray(IV_LENGTH + TAG_LENGTH);

    const decipher = crypto.createDecipheriv(ALGORITHM, this.key, iv);
    decipher.setAuthTag(tag);

    return decipher.update(encrypted) + decipher.final('utf8');
  }
}
