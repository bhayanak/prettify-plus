import { describe, it, expect } from 'vitest';
import { parseCSV } from '@/viewer/parsers/csv-parser';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const sampleCSV = readFileSync(resolve(__dirname, '../fixtures/sample.csv'), 'utf-8');

describe('parseCSV', () => {
  it('parses simple CSV', () => {
    const { data, nodes } = parseCSV('name,age\nAlice,30\nBob,25');
    expect(Array.isArray(data)).toBe(true);
    expect((data as Record<string, unknown>[]).length).toBe(2);
    expect(nodes.length).toBeGreaterThan(0);
  });

  it('parses sample fixture', () => {
    const { data, nodes } = parseCSV(sampleCSV);
    const rows = data as Record<string, unknown>[];
    expect(rows.length).toBe(3);
    expect(rows[0]).toHaveProperty('name', 'Alice');
    expect(nodes.length).toBeGreaterThan(3);
  });

  it('handles dynamic typing', () => {
    const { data } = parseCSV('name,age,active\nAlice,30,true');
    const rows = data as Record<string, unknown>[];
    expect(rows[0].age).toBe(30);
    expect(rows[0].active).toBe(true);
  });

  it('skips empty lines', () => {
    const { data } = parseCSV('name,age\nAlice,30\n\nBob,25\n');
    const rows = data as Record<string, unknown>[];
    expect(rows.length).toBe(2);
  });
});
