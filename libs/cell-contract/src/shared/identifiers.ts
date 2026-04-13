import { z } from 'zod';

/**
 * Validates a snake_case identifier: starts with a lowercase letter,
 * followed by zero or more lowercase letters, digits, or underscores.
 *
 * Valid:   "customer_order", "invoice_line", "a", "field1"
 * Invalid: "CustomerOrder", "_private", "1field", "camelCase"
 */
export const snakeCaseKeySchema = z
  .string()
  .regex(
    /^[a-z][a-z0-9_]*$/,
    'Must start with a lowercase letter and contain only lowercase letters, digits, or underscores (e.g. "customer_order")',
  );
