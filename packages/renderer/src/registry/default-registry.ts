import { createCellComponentRegistry } from './cell-component-registry';
import { EntityListPage } from '../pages/entity-list-page';
import { EntityDetailPage } from '../pages/entity-detail-page';
import { EntityCreatePage } from '../pages/entity-create-page';
import { EntityEditPage } from '../pages/entity-edit-page';
import { DashboardPage } from '../pages/dashboard-page';
import { CustomPage } from '../pages/custom-page';

export const defaultCellComponentRegistry = createCellComponentRegistry();

defaultCellComponentRegistry.register('entity-list', EntityListPage);
defaultCellComponentRegistry.register('entity-detail', EntityDetailPage);
defaultCellComponentRegistry.register('entity-create', EntityCreatePage);
defaultCellComponentRegistry.register('entity-edit', EntityEditPage);
defaultCellComponentRegistry.register('dashboard', DashboardPage);
defaultCellComponentRegistry.register('custom', CustomPage);
