import { Injectable, type OnApplicationBootstrap, type BeforeApplicationShutdown } from '@nestjs/common';
import { LogRepository } from '../repositories/log.repository';

const CLEANUP_INTERVAL_MS = 60 * 60 * 1000; // hourly

@Injectable()
export class LogCleanupService implements OnApplicationBootstrap, BeforeApplicationShutdown {
  private interval?: ReturnType<typeof setInterval>;

  constructor(private readonly repo: LogRepository) {}

  onApplicationBootstrap(): void {
    this.interval = setInterval(() => void this.cleanup(), CLEANUP_INTERVAL_MS);
  }

  beforeApplicationShutdown(): void {
    if (this.interval) {
      clearInterval(this.interval);
    }
  }

  async cleanup(): Promise<void> {
    try {
      await this.repo.deleteExpired();
    } catch {
      // Cleanup errors must not crash the application
    }
  }
}
