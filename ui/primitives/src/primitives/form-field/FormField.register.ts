import type { FormFieldPresentation } from '@ikary/presentation';
import { registerPrimitive } from '../../registry/primitiveRegistry';
import type { PrimitiveResolver } from '../../types/PrimitiveTypes';
import { buildFormFieldViewModel, type BuildFormFieldViewModelInput } from './FormField.adapter';
import { FormField } from './FormField';
import type { FormFieldViewProps } from './FormField.types';

export type FormFieldResolverRuntime = Omit<BuildFormFieldViewModelInput, 'presentation'>;

const resolveFormField: PrimitiveResolver<FormFieldPresentation, FormFieldViewProps, FormFieldResolverRuntime> = (
  presentation,
  runtime,
) =>
  buildFormFieldViewModel({
    presentation,
    ...runtime,
  });

registerPrimitive('form-field', {
  component: FormField,
  resolver: resolveFormField,
});
