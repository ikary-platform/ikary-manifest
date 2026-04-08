import type { FormSectionPresentation } from '@ikary/presentation';
import { registerPrimitive } from '../../registry/primitiveRegistry';
import type { PrimitiveResolver } from '../../types/PrimitiveTypes';
import { buildFormSectionViewModel, type BuildFormSectionViewModelInput } from './FormSection.adapter';
import { FormSection } from './FormSection';
import type { FormSectionViewProps } from './FormSection.types';

export type FormSectionResolverRuntime = Omit<BuildFormSectionViewModelInput, 'presentation'>;

const resolveFormSection: PrimitiveResolver<
  FormSectionPresentation,
  FormSectionViewProps,
  FormSectionResolverRuntime
> = (presentation, runtime) =>
  buildFormSectionViewModel({
    presentation,
    ...runtime,
  });

registerPrimitive('form-section', {
  component: FormSection,
  resolver: resolveFormSection,
});
