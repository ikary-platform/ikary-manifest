import type { ComponentType } from 'react';

export type PrimitiveComponent<Props = any> = ComponentType<Props>;

export type PrimitiveResolver<ContractProps = unknown, ResolvedProps = unknown, Context = unknown> = (
  props: ContractProps,
  context: Context,
) => ResolvedProps | Promise<ResolvedProps>;

export type UIPrimitiveDefinition<ContractProps = unknown, ResolvedProps = unknown, Context = unknown> = {
  name: string;
  component: PrimitiveComponent<ResolvedProps>;
  resolver?: PrimitiveResolver<ContractProps, ResolvedProps, Context>;
  isController?: boolean;
};

export type RegisterablePrimitive<ContractProps = unknown, ResolvedProps = unknown, Context = unknown> =
  | PrimitiveComponent<ResolvedProps>
  | {
      component: PrimitiveComponent<ResolvedProps>;
      resolver?: PrimitiveResolver<ContractProps, ResolvedProps, Context>;
    };
