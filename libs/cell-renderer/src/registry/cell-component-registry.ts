import type React from 'react';
import type { EntityDefinition, PageDefinition, PageType } from '@ikary/cell-contract';

export interface CellPageRendererProps {
  page: PageDefinition;
  entity?: EntityDefinition;
}

export type PageRendererComponent = React.ComponentType<CellPageRendererProps>;

export interface CellComponentRegistry {
  register(pageType: PageType, renderer: PageRendererComponent): void;
  resolve(pageType: PageType): PageRendererComponent;
}

export function createCellComponentRegistry(): CellComponentRegistry {
  const map = new Map<PageType, PageRendererComponent>();

  return {
    register(pageType: PageType, renderer: PageRendererComponent): void {
      map.set(pageType, renderer);
    },
    resolve(pageType: PageType): PageRendererComponent {
      const renderer = map.get(pageType);
      if (!renderer) {
        throw new Error(`No renderer registered for page type: ${pageType}`);
      }
      return renderer;
    },
  };
}
