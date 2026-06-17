import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { EmbedDraft } from '../helpers';

const TTL_MS = 15 * 60 * 1000;

export interface PendingDestination {
  userId: string;
  discordGuildId: string;
  channelId: string;
  broadcasterId: string;
  eventType: string;
  draft: EmbedDraft;
}

@Injectable()
export class PendingDestinationStore {
  private readonly entries = new Map<string, PendingDestination>();
  private readonly timeouts = new Map<string, NodeJS.Timeout>();

  create(data: PendingDestination): string {
    const token = randomUUID();
    this.entries.set(token, data);
    this.scheduleExpiry(token);
    return token;
  }

  get(token: string): PendingDestination | undefined {
    return this.entries.get(token);
  }

  update(token: string, draft: EmbedDraft) {
    const entry = this.entries.get(token);
    if (!entry) return;
    entry.draft = draft;
    this.scheduleExpiry(token);
  }

  delete(token: string) {
    this.entries.delete(token);
    const timeout = this.timeouts.get(token);
    if (timeout) {
      clearTimeout(timeout);
      this.timeouts.delete(token);
    }
  }

  private scheduleExpiry(token: string) {
    const existing = this.timeouts.get(token);
    if (existing) clearTimeout(existing);
    this.timeouts.set(token, setTimeout(() => this.delete(token), TTL_MS));
  }
}
