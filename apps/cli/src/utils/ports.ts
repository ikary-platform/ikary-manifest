/**
 * Canonical port assignments for the IKARY local stack.
 *
 * Stack ports (4500–4502):
 *   4500  Preview Server
 *   4501  Data API (cell-runtime-api)
 *   4502  MCP Server
 *
 * Standard ports (unchanged):
 *   5432  PostgreSQL
 */
export const PORTS = {
  PREVIEW:    4500,
  DATA_API:   4501,
  MCP_SERVER: 4502,
} as const;
