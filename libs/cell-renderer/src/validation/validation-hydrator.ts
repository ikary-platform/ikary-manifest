import type { ValidationIssue } from '@ikary/cell-contract';

export interface HydratedValidation {
  fieldErrors: Record<string, { message: string; ruleId: string }>;
  summaryIssues: ValidationIssue[];
}

export function hydrateValidationIssues(issues: ValidationIssue[]): HydratedValidation {
  const fieldErrors: HydratedValidation['fieldErrors'] = {};
  const summaryIssues: ValidationIssue[] = [];

  for (const issue of issues) {
    if (issue.path && !fieldErrors[issue.path]) {
      fieldErrors[issue.path] = {
        message: issue.defaultMessage ?? issue.messageKey,
        ruleId: issue.ruleId,
      };
    } else {
      summaryIssues.push(issue);
    }
  }

  return { fieldErrors, summaryIssues };
}
