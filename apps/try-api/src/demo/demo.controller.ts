import { Controller, Get, Inject } from '@nestjs/common';
import { SYSTEM_AI_CONFIG } from '@ikary/system-ai/server';
import type { AiRuntimeConfig } from '@ikary/system-ai';

export type DemoStatusReason = 'FEATURE_DISABLED' | 'BUDGET_EXHAUSTED';

export interface DemoStatus {
  aiAvailable: boolean;
  reason?: DemoStatusReason;
}

@Controller('demo')
export class DemoController {
  constructor(@Inject(SYSTEM_AI_CONFIG) private readonly config: AiRuntimeConfig) {}

  /**
   * Lightweight status probe the SPA calls on mount (and may poll later).
   * When AI is unavailable the client falls back to blueprints-only mode:
   * chat composer disabled, blueprint gallery surfaced inline in the chat rail.
   *
   * Today only FEATURE_AI_ENABLED gates this. When the global daily USD
   * kill-switch lands (Week 3), BUDGET_EXHAUSTED will use the same path.
   */
  @Get('status')
  status(): DemoStatus {
    if (!this.config.featureAiEnabled) {
      return { aiAvailable: false, reason: 'FEATURE_DISABLED' };
    }
    return { aiAvailable: true };
  }
}
