import { describe, it, expect } from 'vitest';
import { validatePresentationLayerSemantics } from './presentation-rules';
import type { PresentationLayer } from '../contract/manifest/PresentationLayerSchema';

const basePage = { key: 'dashboard', type: 'dashboard' as const, title: 'Dashboard', path: '/dashboard' };
const entityListPage = { key: 'customers', type: 'entity-list' as const, title: 'Customers', path: '/customers', entity: 'customer' };

describe('validatePresentationLayerSemantics', () => {
  it('returns no errors for a valid layer', () => {
    const layer: PresentationLayer = {
      mount: { mountPath: '/', landingPage: 'dashboard' },
      pages: [basePage],
    };
    expect(validatePresentationLayerSemantics(layer)).toEqual([]);
  });

  it('errors when landingPage does not match any page key', () => {
    const layer: PresentationLayer = {
      mount: { mountPath: '/', landingPage: 'nonexistent' },
      pages: [basePage],
    };
    const errors = validatePresentationLayerSemantics(layer);
    expect(errors.some((e) => e.field === 'mount.landingPage')).toBe(true);
  });

  it('skips landingPage check when no pages are defined', () => {
    const layer: PresentationLayer = {
      mount: { mountPath: '/', landingPage: 'anything' },
      pages: [],
    };
    expect(validatePresentationLayerSemantics(layer)).toEqual([]);
  });

  it('skips landingPage check when mount is absent', () => {
    const layer: PresentationLayer = { pages: [basePage] };
    expect(validatePresentationLayerSemantics(layer)).toEqual([]);
  });

  it('errors when entity-bound page has no entity key', () => {
    const page = { key: 'list', type: 'entity-list' as const, title: 'List', path: '/list' };
    const layer: PresentationLayer = { pages: [page] };
    const errors = validatePresentationLayerSemantics(layer);
    expect(errors.some((e) => e.field.includes('entity'))).toBe(true);
  });

  it('errors when entity-bound page references unknown entity', () => {
    const layer: PresentationLayer = { pages: [entityListPage] };
    const errors = validatePresentationLayerSemantics(layer, { entityKeys: ['invoice'] });
    expect(errors.some((e) => e.message.includes('unknown entity key'))).toBe(true);
  });

  it('accepts entity-bound page when entity exists in context', () => {
    const layer: PresentationLayer = { pages: [entityListPage] };
    const errors = validatePresentationLayerSemantics(layer, { entityKeys: ['customer'] });
    expect(errors).toEqual([]);
  });

  it('skips entity check when entityKeySet is empty (no context)', () => {
    const layer: PresentationLayer = { pages: [entityListPage] };
    const errors = validatePresentationLayerSemantics(layer);
    expect(errors).toEqual([]);
  });

  it('validates navigation items when navigation is present', () => {
    const layer: PresentationLayer = {
      mount: { mountPath: '/', landingPage: 'dashboard' },
      pages: [basePage],
      navigation: {
        items: [{ type: 'page' as const, key: 'nav-dashboard', pageKey: 'nonexistent-page', order: 0 }],
      },
    };
    const errors = validatePresentationLayerSemantics(layer);
    expect(errors.some((e) => e.message.includes('nonexistent-page'))).toBe(true);
  });

  it('returns no errors when navigation is absent', () => {
    const layer: PresentationLayer = { pages: [basePage] };
    expect(validatePresentationLayerSemantics(layer)).toEqual([]);
  });

  it('handles undefined pages (pages ?? [] branch)', () => {
    const layer = {} as PresentationLayer;
    expect(validatePresentationLayerSemantics(layer)).toEqual([]);
  });

  it('handles navigation with no items (items ?? [] branch)', () => {
    const layer: PresentationLayer = {
      pages: [basePage],
      navigation: {} as never,
    };
    expect(validatePresentationLayerSemantics(layer)).toEqual([]);
  });
});
