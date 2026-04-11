import { Navigate, Route, Routes, useNavigate, useParams } from 'react-router-dom';
import { LaunchpadPage } from '../pages/launchpad-page';
import { BuilderPage } from '../pages/builder-page';
import { StudioPage } from '../pages/studio-page';
import {
  resolveBlock,
  resolveLegacyMode,
  toBlockPath,
  toTabPath,
} from '../features/launchpad/launchpad-routes';

function ViewsBlockRoute() {
  const { blockSlug } = useParams<{ blockSlug: string }>();
  const navigate = useNavigate();

  if (!blockSlug) {
    return <Navigate to={toTabPath('views')} replace />;
  }

  const resolved = resolveBlock('views', blockSlug);
  if (!resolved) {
    return <Navigate to={toTabPath('views')} replace />;
  }

  if (blockSlug !== resolved.slug) {
    return <Navigate to={toBlockPath('views', resolved.slug)} replace />;
  }

  if (resolved.destination.kind === 'studio') {
    return <StudioPage backPath={toTabPath('views')} />;
  }

  if (resolved.destination.kind === 'builder') {
    return <BuilderPage mode={resolved.destination.mode} onBack={() => navigate(toTabPath('views'))} />;
  }

  return <Navigate to={toTabPath('views')} replace />;
}

function DataBlockRoute() {
  const { blockSlug } = useParams<{ blockSlug: string }>();
  const navigate = useNavigate();

  if (!blockSlug) {
    return <Navigate to={toTabPath('data')} replace />;
  }

  const resolved = resolveBlock('data', blockSlug);
  if (!resolved) {
    return <Navigate to={toTabPath('data')} replace />;
  }

  if (blockSlug !== resolved.slug) {
    return <Navigate to={toBlockPath('data', resolved.slug)} replace />;
  }

  if (resolved.destination.kind !== 'builder') {
    return <Navigate to={toTabPath('data')} replace />;
  }

  return <BuilderPage mode={resolved.destination.mode} onBack={() => navigate(toTabPath('data'))} />;
}


function LegacyModeRoute() {
  const { mode } = useParams<{ mode: string }>();
  if (!mode) {
    return <Navigate to={toTabPath('views')} replace />;
  }

  const canonicalPath = resolveLegacyMode(mode);
  if (!canonicalPath) {
    return <Navigate to={toTabPath('views')} replace />;
  }

  return <Navigate to={canonicalPath} replace />;
}

function LegacyViewAliasRoute() {
  const { blockSlug } = useParams<{ blockSlug: string }>();
  if (!blockSlug) {
    return <Navigate to={toTabPath('views')} replace />;
  }

  const resolved = resolveBlock('views', blockSlug);
  if (!resolved) {
    return <Navigate to={toTabPath('views')} replace />;
  }

  return <Navigate to={toBlockPath('views', resolved.slug)} replace />;
}

export function Root() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to={toTabPath('views')} replace />} />

      <Route path="/studio" element={<Navigate to={toBlockPath('views', 'studio')} replace />} />
      <Route path="/view" element={<Navigate to={toTabPath('views')} replace />} />
      <Route path="/view/:blockSlug" element={<LegacyViewAliasRoute />} />

      <Route path="/views" element={<LaunchpadPage tab="views" />} />
      <Route path="/data" element={<LaunchpadPage tab="data" />} />
      <Route path="/primitives" element={<Navigate to={toTabPath('views')} replace />} />
      <Route path="/schemas" element={<LaunchpadPage tab="schemas" />} />

      <Route path="/views/:blockSlug" element={<ViewsBlockRoute />} />
      <Route path="/data/:blockSlug" element={<DataBlockRoute />} />
      <Route path="/primitives/:blockSlug" element={<Navigate to={toTabPath('views')} replace />} />
      <Route path="/runtime" element={<Navigate to={toTabPath('views')} replace />} />
      <Route path="/runtime/:blockSlug" element={<Navigate to={toTabPath('views')} replace />} />

      <Route path="/:mode" element={<LegacyModeRoute />} />
      <Route path="*" element={<Navigate to={toTabPath('views')} replace />} />
    </Routes>
  );
}
