import { describe, expect, it } from 'vitest';
import { parsePromptFile } from './frontmatter-parser';
import { PromptRegistryError } from './error-codes';

const path = '/prompts/test/example.prompt.md';

describe('parsePromptFile', () => {
  it('splits frontmatter and body for a valid file', () => {
    const source = '---\nname: a/b\ndescription: d\n---\nHello world';
    const result = parsePromptFile(source, path);
    expect(result.frontmatter).toEqual({ name: 'a/b', description: 'd' });
    expect(result.body).toBe('Hello world');
  });

  it('handles CRLF line endings', () => {
    const source = '---\r\nname: a/b\r\n---\r\nbody line';
    const result = parsePromptFile(source, path);
    expect(result.frontmatter).toEqual({ name: 'a/b' });
    expect(result.body).toBe('body line');
  });

  it('preserves --- inside the body', () => {
    const source = '---\nname: a/b\n---\nleading\n---\ntrailing';
    const result = parsePromptFile(source, path);
    expect(result.body).toBe('leading\n---\ntrailing');
  });

  it('throws when the opening fence is missing', () => {
    expect(() => parsePromptFile('no fences here', path)).toThrowError(PromptRegistryError);
  });

  it('throws when the closing fence is missing', () => {
    expect(() => parsePromptFile('---\nname: a/b\nbody only', path)).toThrowError(
      PromptRegistryError,
    );
  });

  it('throws when the body is empty', () => {
    expect(() => parsePromptFile('---\nname: a/b\n---\n   \n', path)).toThrowError(
      PromptRegistryError,
    );
  });

  it('throws when the YAML is not parseable', () => {
    expect(() => parsePromptFile('---\nname: : :\n---\nbody', path)).toThrowError(
      PromptRegistryError,
    );
  });

  it('throws when the frontmatter parses to a non-object (array)', () => {
    expect(() => parsePromptFile('---\n- a\n- b\n---\nbody', path)).toThrowError(
      PromptRegistryError,
    );
  });

  it('throws when the frontmatter parses to null', () => {
    expect(() => parsePromptFile('---\n\n---\nbody', path)).toThrowError(PromptRegistryError);
  });
});
