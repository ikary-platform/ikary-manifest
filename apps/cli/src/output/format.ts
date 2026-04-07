import ora from 'ora';
import logSymbols from 'log-symbols';
import { theme } from './theme.js';

export function section(title: string): void {
  console.log('');
  console.log(theme.section(title));
}

export function body(text: string): void {
  console.log(theme.body(text));
}

export function muted(text: string): void {
  console.log(theme.muted(text));
}

export function success(text: string): void {
  console.log(`${logSymbols.success} ${theme.success(text)}`);
}

export function error(text: string): void {
  console.log(`${logSymbols.error} ${theme.error(text)}`);
}

export function info(text: string): void {
  console.log(`${logSymbols.info} ${theme.body(text)}`);
}

export function newline(): void {
  console.log('');
}

export function createSpinner(text: string) {
  return ora({ text: theme.body(text), spinner: 'dots' });
}
