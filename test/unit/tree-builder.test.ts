import { describe, it, expect } from 'vitest';
import { buildTreeFromValue } from '@/viewer/parsers/tree-builder';

describe('buildTreeFromValue', () => {
  it('builds tree from simple object', () => {
    const nodes = buildTreeFromValue({ a: 1, b: 'hello' }, '$', 0);
    expect(nodes.length).toBe(3); // root + 2 children
    expect(nodes[0].type).toBe('object');
    expect(nodes[0].childCount).toBe(2);
  });

  it('builds tree from array', () => {
    const nodes = buildTreeFromValue([1, 2, 3], '$', 0);
    expect(nodes.length).toBe(4); // root array + 3 items
    expect(nodes[0].type).toBe('array');
    expect(nodes[0].childCount).toBe(3);
  });

  it('handles nested objects', () => {
    const nodes = buildTreeFromValue({ a: { b: 1 } }, '$', 0);
    expect(nodes.length).toBe(3); // root + a(object) + b(number)
    const bNode = nodes.find((n) => n.key === 'b');
    expect(bNode?.value).toBe(1);
    expect(bNode?.depth).toBe(2);
  });

  it('handles null value', () => {
    const nodes = buildTreeFromValue(null, '$', 0);
    expect(nodes.length).toBe(1);
    expect(nodes[0].type).toBe('null');
  });

  it('handles string value', () => {
    const nodes = buildTreeFromValue('hello', '$', 0);
    expect(nodes.length).toBe(1);
    expect(nodes[0].type).toBe('string');
  });

  it('handles boolean value', () => {
    const nodes = buildTreeFromValue(true, '$', 0);
    expect(nodes.length).toBe(1);
    expect(nodes[0].type).toBe('boolean');
  });

  it('handles number value', () => {
    const nodes = buildTreeFromValue(42, '$', 0);
    expect(nodes.length).toBe(1);
    expect(nodes[0].type).toBe('number');
  });

  it('handles undefined as null', () => {
    const nodes = buildTreeFromValue(undefined, '$', 0);
    expect(nodes.length).toBe(1);
    expect(nodes[0].type).toBe('null');
  });

  it('sets correct paths for arrays', () => {
    const nodes = buildTreeFromValue([{ name: 'a' }], '$', 0);
    const paths = nodes.map((n) => n.path);
    expect(paths).toContain('$');
    expect(paths).toContain('$[0]');
    expect(paths).toContain('$[0].name');
  });

  it('extracts key from bracket notation', () => {
    const nodes = buildTreeFromValue([10], '$', 0);
    const childNode = nodes.find((n) => n.path === '$[0]');
    expect(childNode?.key).toBe('0');
  });

  it('collapses nodes deeper than 3', () => {
    const deep = { a: { b: { c: { d: 1 } } } };
    const nodes = buildTreeFromValue(deep, '$', 0);
    // $ depth=0, a depth=1, b depth=2, c depth=3, d depth=4
    const rootNode = nodes.find((n) => n.path === '$');
    expect(rootNode?.isExpanded).toBe(true); // depth 0 < 3

    const cNode = nodes.find((n) => n.key === 'c');
    // c is at depth 3, has children, so isExpanded = 3 < 3 = false
    expect(cNode?.isExpanded).toBe(false);

    const deepNode = nodes.find((n) => n.key === 'd');
    // depth=4, primitive, isExpanded = false
    expect(deepNode?.isExpanded).toBe(false);
  });
});
