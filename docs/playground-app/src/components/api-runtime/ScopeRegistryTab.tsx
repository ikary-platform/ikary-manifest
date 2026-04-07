import { ScopeRegistrySection } from './ScopeRegistrySection';

interface ScopeRegistryTabProps {
  scopes: string[];
}

export function ScopeRegistryTab({ scopes }: ScopeRegistryTabProps) {
  if (scopes.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-sm text-gray-400 dark:text-gray-500">
          No scopes derived.
        </p>
      </div>
    );
  }

  return <ScopeRegistrySection scopes={scopes} />;
}
