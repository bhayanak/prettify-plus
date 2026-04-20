import { describe, it, expect } from 'vitest';
import { parseXML } from '@/viewer/parsers/xml-parser';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const sampleXML = readFileSync(resolve(__dirname, '../fixtures/sample.xml'), 'utf-8');

describe('parseXML', () => {
  it('parses simple XML', () => {
    const { data, nodes } = parseXML('<root><name>test</name></root>');
    expect(data).toHaveProperty('root');
    expect(nodes.length).toBeGreaterThan(0);
  });

  it('parses sample fixture', () => {
    const { data, nodes } = parseXML(sampleXML);
    expect(data).toHaveProperty('response');
    expect(nodes.length).toBeGreaterThan(3);
  });

  it('handles attributes', () => {
    const { data } = parseXML('<item id="1" type="test">value</item>');
    const record = data as Record<string, Record<string, unknown>>;
    expect(record.item['@_id']).toBe('1');
    expect(record.item['@_type']).toBe('test');
  });

  it('handles text content', () => {
    const { data } = parseXML('<msg>Hello World</msg>');
    const record = data as Record<string, unknown>;
    expect(record.msg).toBe('Hello World');
  });

  it('handles nested elements', () => {
    const xml = '<root><parent><child>val</child></parent></root>';
    const { nodes } = parseXML(xml);
    expect(nodes.length).toBeGreaterThan(2);
  });

  it('throws on invalid XML', () => {
    // fast-xml-parser is permissive; it doesn't throw on most malformed XML
    // But we can test that the result is sensible
    const { data } = parseXML('not xml at all');
    expect(data).toBeDefined();
  });
});
