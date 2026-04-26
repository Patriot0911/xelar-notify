import { Injectable } from '@nestjs/common';
import bcrypt from 'bcryptjs';

@Injectable()
export class PasswordService {
  async hash(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
  }

  async verify(hashed: string, plain: string): Promise<boolean> {
    return bcrypt.compare(plain, hashed);
  }
}
