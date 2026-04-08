import { registerPrimitive } from '../../registry/primitiveRegistry';
import type { PrimitiveResolver } from '../../types/PrimitiveTypes';
import { DashboardPage } from './DashboardPage';
import { resolveDashboardPage, type DashboardPageResolverRuntime } from './DashboardPage.resolver';
import type { DashboardPageViewProps } from './DashboardPage.types';

const dashboardPageResolver: PrimitiveResolver<unknown, DashboardPageViewProps, DashboardPageResolverRuntime> = (
  presentation,
  runtime,
) => resolveDashboardPage(presentation, runtime);

export function registerDashboardPage(): void {
  registerPrimitive('dashboard-page', {
    component: DashboardPage,
    resolver: dashboardPageResolver,
  });
}

registerDashboardPage();
