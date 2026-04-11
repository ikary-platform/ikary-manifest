import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { RegistryService } from './registry.service';

// Each segment: one or more uppercase letters, digits, or underscores.
const SEGMENT_RE = /^[A-Z0-9_]+$/;

function validateNamespacedCode(raw: string): string {
  const upper = raw.trim().toUpperCase();
  const parts = upper.split('.');

  if (parts.length < 3) {
    throw new BadRequestException(
      `Permission code "${raw}" must follow NAMESPACE.RESOURCE.ACTION format (at least 3 dot-separated segments).`,
    );
  }

  for (const part of parts) {
    if (!part || !SEGMENT_RE.test(part)) {
      throw new BadRequestException(
        `Permission code "${raw}" contains an invalid segment "${part}". Each segment must be non-empty and contain only uppercase letters, digits, or underscores.`,
      );
    }
  }

  return upper;
}

export interface NamespacedPermission {
  /** Full code: NAMESPACE.RESOURCE.ACTION (e.g. WORKSPACE.MEMBER.INVITE) */
  code: string;
  description?: string;
}

@Injectable()
export class PermissionNamespaceRegistry {
  constructor(@Inject(RegistryService) private readonly registry: RegistryService) {}

  /**
   * Validate and register a single namespaced feature permission.
   * Code must follow NAMESPACE.RESOURCE.ACTION format.
   */
  async registerPermission(code: string, description?: string): Promise<void> {
    const normalized = validateNamespacedCode(code);
    await this.registry.registerFeature(normalized, description);
  }

  /**
   * Validate and register multiple namespaced feature permissions in one call.
   * Each code must follow NAMESPACE.RESOURCE.ACTION format.
   * All codes are validated before any are registered; throws on the first invalid code.
   */
  async registerPermissions(permissions: NamespacedPermission[]): Promise<void> {
    // Validate all first so we fail atomically before touching the DB.
    const normalized = permissions.map((p) => ({
      code: validateNamespacedCode(p.code),
      description: p.description,
    }));

    for (const p of normalized) {
      await this.registry.registerFeature(p.code, p.description);
    }
  }

  /**
   * Parse a namespaced code and return its structural segments.
   * Throws if the format is invalid.
   *
   * Example: 'workspace.member.invite' → { namespace: 'WORKSPACE', resource: 'MEMBER', action: 'INVITE', full: 'WORKSPACE.MEMBER.INVITE' }
   */
  parseCode(code: string): { namespace: string; resource: string; action: string; full: string } {
    const full = validateNamespacedCode(code);
    const [namespace, resource, ...rest] = full.split('.');
    // For codes with more than 3 segments, the action is everything after namespace.resource
    const action = rest.join('.');
    return { namespace, resource, action, full };
  }

  /**
   * Check whether a code string is a valid NAMESPACE.RESOURCE.ACTION code.
   * Returns false instead of throwing.
   */
  isValidCode(code: string): boolean {
    try {
      validateNamespacedCode(code);
      return true;
    } catch {
      return false;
    }
  }
}
