import { describe, it, expect } from 'vitest';
import { parseYAML } from '@/viewer/parsers/yaml-parser';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const sampleYAML = readFileSync(resolve(__dirname, '../fixtures/sample.yaml'), 'utf-8');

describe('parseYAML', () => {
  it('parses a YAML mapping', () => {
    const { data, nodes } = parseYAML('name: test\nvalue: 42');
    expect(data).toEqual({ name: 'test', value: 42 });
    expect(nodes.length).toBeGreaterThan(0);
  });

  it('parses sample fixture', () => {
    const { data, nodes } = parseYAML(sampleYAML);
    expect(data).toHaveProperty('users');
    expect(data).toHaveProperty('total', 2);
    expect(nodes.length).toBeGreaterThan(5);
  });

  it('parses nested structures', () => {
    const yaml = 'server:\n  host: localhost\n  port: 8080';
    const { data, nodes } = parseYAML(yaml);
    expect(data).toHaveProperty('server');
    const hostNode = nodes.find((n) => n.key === 'host');
    expect(hostNode?.value).toBe('localhost');
  });

  it('parses sequences', () => {
    const yaml = 'items:\n  - one\n  - two\n  - three';
    const { data } = parseYAML(yaml);
    const record = data as Record<string, unknown>;
    expect(record.items).toEqual(['one', 'two', 'three']);
  });

  it('throws on invalid YAML', () => {
    expect(() => parseYAML('{{invalid')).toThrow();
  });
});
