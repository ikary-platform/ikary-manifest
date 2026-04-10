import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { LogCleanupService } from './log-cleanup.service.js';

const CLEANUP_INTERVAL_MS = 60 * 60 * 1000;

describe('LogCleanupService', () => {
  let mockRepo: { deleteExpired: ReturnType<typeof vi.fn> };
  let service: LogCleanupService;

  beforeEach(() => {
    vi.useFakeTimers();
    mockRepo = { deleteExpired: vi.fn().mockResolvedValue(undefined) };
    service = new LogCleanupService(mockRepo as any);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('starts an hourly cleanup interval on bootstrap', async () => {
    service.onApplicationBootstrap();
    vi.advanceTimersByTime(CLEANUP_INTERVAL_MS);
    await Promise.resolve(); // flush async microtasks
    expect(mockRepo.deleteExpired).toHaveBeenCalledTimes(1);
  });

  it('fires multiple times as the interval repeats', async () => {
    service.onApplicationBootstrap();
    vi.advanceTimersByTime(CLEANUP_INTERVAL_MS * 3);
    await Promise.resolve();
    expect(mockRepo.deleteExpired).toHaveBeenCalledTimes(3);
  });

  it('stops the interval on shutdown', async () => {
    service.onApplicationBootstrap();
    service.beforeApplicationShutdown();
    vi.advanceTimersByTime(CLEANUP_INTERVAL_MS * 2);
    await Promise.resolve();
    expect(mockRepo.deleteExpired).not.toHaveBeenCalled();
  });

  it('beforeApplicationShutdown is safe when no interval was started', () => {
    expect(() => service.beforeApplicationShutdown()).not.toThrow();
  });

  it('cleanup() resolves without throwing', async () => {
    await expect(service.cleanup()).resolves.not.toThrow();
    expect(mockRepo.deleteExpired).toHaveBeenCalledTimes(1);
  });

  it('cleanup() swallows errors from repo', async () => {
    mockRepo.deleteExpired.mockRejectedValue(new Error('DB exploded'));
    await expect(service.cleanup()).resolves.not.toThrow();
  });
});
