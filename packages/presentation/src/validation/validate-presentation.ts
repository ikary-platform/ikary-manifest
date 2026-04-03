import type { PresentationValidationError } from './types';
import { DataGridPresentationSchema } from '../contract/data-grid/DataGridPresentationSchema';
import { PaginationPresentationSchema } from '../contract/pagination/PaginationPresentationSchema';
import { PageHeaderPresentationSchema } from '../contract/page-header/PageHeaderPresentationSchema';
import { DetailSectionPresentationSchema } from '../contract/detail-section/DetailSectionPresentationSchema';
import { FormFieldPresentationSchema } from '../contract/form-field/FormFieldPresentationSchema';
import { FormSectionPresentationSchema } from '../contract/form-section/FormSectionPresentationSchema';
import { IkaryFormPresentationSchema } from '../contract/form/IkaryFormPresentationSchema';
import { validateDataGridPresentation } from './semantic/validate-data-grid-presentation';
import { validatePaginationPresentation } from './semantic/validate-pagination-presentation';
import { validatePageHeaderPresentation } from './semantic/validate-page-header-presentation';
import { validateDetailSectionPresentation } from './semantic/validate-detail-section-presentation';
import { validateFormFieldPresentation } from './semantic/validate-form-field-presentation';
import { validateFormSectionPresentation } from './semantic/validate-form-section-presentation';
import { validateIkaryFormPresentation } from './semantic/validate-ikary-form-presentation';

export type ValidatePresentationResult<T> =
  | {
      ok: true;
      value: T;
      errors: [];
    }
  | {
      ok: false;
      errors: PresentationValidationError[];
    };

export function validatePresentation(input: unknown): ValidatePresentationResult<unknown> {
  if (!isRecord(input) || typeof input['type'] !== 'string') {
    return {
      ok: false,
      errors: [
        {
          path: 'type',
          message: 'Presentation type is required',
          code: 'STRUCTURAL_VALIDATION_ERROR',
        },
      ],
    };
  }

  switch (input['type']) {
    case 'data-grid': {
      const parsed = DataGridPresentationSchema.safeParse(input);

      if (!parsed.success) {
        return {
          ok: false,
          errors: toStructuralErrors(parsed.error.issues),
        };
      }

      const semanticErrors = validateDataGridPresentation(parsed.data);
      if (semanticErrors.length > 0) {
        return {
          ok: false,
          errors: semanticErrors,
        };
      }

      return {
        ok: true,
        value: parsed.data,
        errors: [],
      };
    }

    case 'pagination': {
      const parsed = PaginationPresentationSchema.safeParse(input);

      if (!parsed.success) {
        return {
          ok: false,
          errors: toStructuralErrors(parsed.error.issues),
        };
      }

      const semanticErrors = validatePaginationPresentation(parsed.data);
      if (semanticErrors.length > 0) {
        return {
          ok: false,
          errors: semanticErrors,
        };
      }

      return {
        ok: true,
        value: parsed.data,
        errors: [],
      };
    }

    case 'page-header': {
      const parsed = PageHeaderPresentationSchema.safeParse(input);

      if (!parsed.success) {
        return {
          ok: false,
          errors: toStructuralErrors(parsed.error.issues),
        };
      }

      const semanticErrors = validatePageHeaderPresentation(parsed.data);
      if (semanticErrors.length > 0) {
        return {
          ok: false,
          errors: semanticErrors,
        };
      }

      return {
        ok: true,
        value: parsed.data,
        errors: [],
      };
    }

    case 'detail-section': {
      const parsed = DetailSectionPresentationSchema.safeParse(input);

      if (!parsed.success) {
        return {
          ok: false,
          errors: toStructuralErrors(parsed.error.issues),
        };
      }

      const semanticErrors = validateDetailSectionPresentation(parsed.data);
      if (semanticErrors.length > 0) {
        return {
          ok: false,
          errors: semanticErrors,
        };
      }

      return {
        ok: true,
        value: parsed.data,
        errors: [],
      };
    }

    case 'form-field': {
      const parsed = FormFieldPresentationSchema.safeParse(input);

      if (!parsed.success) {
        return {
          ok: false,
          errors: toStructuralErrors(parsed.error.issues),
        };
      }

      const semanticErrors = validateFormFieldPresentation(parsed.data);
      if (semanticErrors.length > 0) {
        return {
          ok: false,
          errors: semanticErrors,
        };
      }

      return {
        ok: true,
        value: parsed.data,
        errors: [],
      };
    }

    case 'form-section': {
      const parsed = FormSectionPresentationSchema.safeParse(input);

      if (!parsed.success) {
        return {
          ok: false,
          errors: toStructuralErrors(parsed.error.issues),
        };
      }

      const semanticErrors = validateFormSectionPresentation(parsed.data);
      if (semanticErrors.length > 0) {
        return {
          ok: false,
          errors: semanticErrors,
        };
      }

      return {
        ok: true,
        value: parsed.data,
        errors: [],
      };
    }

    case 'form': {
      const parsed = IkaryFormPresentationSchema.safeParse(input);

      if (!parsed.success) {
        return {
          ok: false,
          errors: toStructuralErrors(parsed.error.issues),
        };
      }

      const semanticErrors = validateIkaryFormPresentation(parsed.data);
      if (semanticErrors.length > 0) {
        return {
          ok: false,
          errors: semanticErrors,
        };
      }

      return {
        ok: true,
        value: parsed.data,
        errors: [],
      };
    }

    default:
      return {
        ok: false,
        errors: [
          {
            path: 'type',
            message: `Unsupported presentation type "${input['type']}"`,
            code: 'UNSUPPORTED_PRESENTATION_TYPE',
          },
        ],
      };
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function toStructuralErrors(
  issues: Array<{ path: Array<string | number>; message: string }>,
): PresentationValidationError[] {
  return issues.map((issue) => ({
    path: issue.path.join('.'),
    message: issue.message,
    code: 'STRUCTURAL_VALIDATION_ERROR',
  }));
}
