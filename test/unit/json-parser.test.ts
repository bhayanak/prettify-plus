import { describe, it, expect } from 'vitest';
import { parseJSON } from '@/viewer/parsers/json-parser';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const sampleJSON = readFileSync(resolve(__dirname, '../fixtures/sample.json'), 'utf-8');

describe('parseJSON', () => {
  it('parses a JSON object', () => {
    const { data, nodes } = parseJSON('{"name":"test"}');
    expect(data).toEqual({ name: 'test' });
    expect(nodes.length).toBeGreaterThan(0);
  });

  it('parses a JSON array', () => {
    const { data, nodes } = parseJSON('[1, 2, 3]');
    expect(data).toEqual([1, 2, 3]);
    expect(nodes.length).toBe(4); // root array + 3 items
  });

  it('parses sample fixture', () => {
    const { data, nodes } = parseJSON(sampleJSON);
    expect(data).toHaveProperty('users');
    expect(data).toHaveProperty('total', 2);
    expect(nodes.length).toBeGreaterThan(5);
  });

  it('correctly sets node types', () => {
    const { nodes } = parseJSON('{"str":"hello","num":42,"bool":true,"nil":null}');
    const typeMap = new Map(nodes.map((n) => [n.key, n.type]));
    expect(typeMap.get('str')).toBe('string');
    expect(typeMap.get('num')).toBe('number');
    expect(typeMap.get('bool')).toBe('boolean');
    expect(typeMap.get('nil')).toBe('null');
  });

  it('builds correct paths', () => {
    const { nodes } = parseJSON('{"a":{"b":1}}');
    const paths = nodes.map((n) => n.path);
    expect(paths).toContain('$');
    expect(paths).toContain('$.a');
    expect(paths).toContain('$.a.b');
  });

  it('builds array paths with bracket notation', () => {
    const { nodes } = parseJSON('[{"id":1}]');
    const paths = nodes.map((n) => n.path);
    expect(paths).toContain('$');
    expect(paths).toContain('$[0]');
    expect(paths).toContain('$[0].id');
  });

  it('sets depth correctly', () => {
    const { nodes } = parseJSON('{"a":{"b":{"c":1}}}');
    const depthMap = new Map(nodes.map((n) => [n.path, n.depth]));
    expect(depthMap.get('$')).toBe(0);
    expect(depthMap.get('$.a')).toBe(1);
    expect(depthMap.get('$.a.b')).toBe(2);
    expect(depthMap.get('$.a.b.c')).toBe(3);
  });

  it('sets childCount correctly', () => {
    const { nodes } = parseJSON('{"a":1,"b":2}');
    const root = nodes.find((n) => n.path === '$');
    expect(root?.childCount).toBe(2);
  });

  it('throws on invalid JSON', () => {
    expect(() => parseJSON('not json')).toThrow();
  });
});
