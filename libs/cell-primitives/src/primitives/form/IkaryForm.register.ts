import type { IkaryFormPresentation } from '@ikary/cell-presentation';
import { registerPrimitive } from '../../registry/primitiveRegistry';
import type { PrimitiveResolver } from '../../types/PrimitiveTypes';
import { buildIkaryFormViewModel, type BuildIkaryFormViewModelInput } from './IkaryForm.adapter';
import { IkaryForm } from './IkaryForm';
import type { IkaryFormViewProps } from './IkaryForm.types';

export type IkaryFormResolverRuntime = Omit<BuildIkaryFormViewModelInput, 'presentation'>;

const resolveIkaryForm: PrimitiveResolver<IkaryFormPresentation, IkaryFormViewProps, IkaryFormResolverRuntime> = (
  presentation,
  runtime,
) =>
  buildIkaryFormViewModel({
    presentation,
    ...runtime,
  });

registerPrimitive(
  'ikary-form',
  {
    component: IkaryForm,
    resolver: resolveIkaryForm,
  },
  { isController: true },
);

// Backward-compatible primitive key for existing layouts and demos.
registerPrimitive(
  'form',
  {
    component: IkaryForm,
    resolver: resolveIkaryForm,
  },
  { isController: true },
);
