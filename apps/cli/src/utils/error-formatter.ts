import { theme } from '../output/theme.js';

interface ValidationError {
  field?: string;
  message: string;
  path?: string;
}

export function formatValidationErrors(errors: ValidationError[]): string[] {
  return errors.map((err) => {
    const location = err.field || err.path || '';
    if (location) {
      return `  ${theme.muted(location)} ${theme.error(err.message)}`;
    }
    return `  ${theme.error(err.message)}`;
  });
}

export function formatZodErrors(issues: Array<{ path: (string | number)[]; message: string }>): string[] {
  return issues.map((issue) => {
    const path = issue.path.join('.');
    return `  ${theme.muted(path || 'root')} ${theme.error(issue.message)}`;
  });
}
