#!/usr/bin/env node

const cliEntry = new URL('./cli.js', import.meta.resolve('@ikary/cli'));
await import(cliEntry.href);
