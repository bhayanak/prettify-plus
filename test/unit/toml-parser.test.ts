import { describe, it, expect } from 'vitest';
import { parseTOML } from '@/viewer/parsers/toml-parser';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const sampleTOML = readFileSync(resolve(__dirname, '../fixtures/sample.toml'), 'utf-8');

describe('parseTOML', () => {
  it('parses simple TOML', () => {
    const { data, nodes } = parseTOML('name = "test"\nvalue = 42');
    const record = data as Record<string, unknown>;
    expect(record.name).toBe('test');
    expect(record.value).toBe(42);
    expect(nodes.length).toBeGreaterThan(0);
  });

  it('parses sample fixture', () => {
    const { data, nodes } = parseTOML(sampleTOML);
    const record = data as Record<string, unknown>;
    expect(record).toHaveProperty('server');
    expect(record).toHaveProperty('database');
    expect(nodes.length).toBeGreaterThan(5);
  });

  it('parses sections', () => {
    const toml = '[server]\nhost = "localhost"\nport = 8080';
    const { data } = parseTOML(toml);
    const record = data as Record<string, Record<string, unknown>>;
    expect(record.server.host).toBe('localhost');
    expect(record.server.port).toBe(8080);
  });

  it('throws on invalid TOML', () => {
    expect(() => parseTOML('{{invalid}}')).toThrow();
  });
});
