import { describe, it, expect } from 'vitest';
import { detectFormat } from '@/content/format-detector';

describe('detectFormat', () => {
  describe('content-type based detection', () => {
    it('detects JSON from content-type', () => {
      const result = detectFormat('{}', 'application/json');
      expect(result.format).toBe('json');
      expect(result.confidence).toBe(1.0);
    });

    it('detects YAML from content-type', () => {
      const result = detectFormat('key: value', 'application/yaml');
      expect(result.format).toBe('yaml');
      expect(result.confidence).toBe(1.0);
    });

    it('detects XML from content-type', () => {
      const result = detectFormat('<root/>', 'application/xml');
      expect(result.format).toBe('xml');
      expect(result.confidence).toBe(1.0);
    });

    it('detects text/yaml content-type', () => {
      const result = detectFormat('key: value', 'text/yaml');
      expect(result.format).toBe('yaml');
      expect(result.confidence).toBe(1.0);
    });

    it('detects text/xml content-type', () => {
      const result = detectFormat('<root/>', 'text/xml');
      expect(result.format).toBe('xml');
      expect(result.confidence).toBe(1.0);
    });

    it('detects text/csv content-type', () => {
      const result = detectFormat('a,b\n1,2', 'text/csv');
      expect(result.format).toBe('csv');
      expect(result.confidence).toBe(1.0);
    });

    it('detects text/json content-type', () => {
      const result = detectFormat('[]', 'text/json');
      expect(result.format).toBe('json');
      expect(result.confidence).toBe(1.0);
    });

    it('detects application/toml content-type', () => {
      const result = detectFormat('key = "val"', 'application/toml');
      expect(result.format).toBe('toml');
      expect(result.confidence).toBe(1.0);
    });

    it('detects text/toml content-type', () => {
      const result = detectFormat('key = "val"', 'text/toml');
      expect(result.format).toBe('toml');
      expect(result.confidence).toBe(1.0);
    });
  });

  describe('content-based detection', () => {
    it('detects JSON object', () => {
      const result = detectFormat('{"name":"test","value":42}');
      expect(result.format).toBe('json');
      expect(result.confidence).toBeGreaterThanOrEqual(0.9);
    });

    it('detects JSON array', () => {
      const result = detectFormat('[1, 2, 3]');
      expect(result.format).toBe('json');
      expect(result.confidence).toBeGreaterThanOrEqual(0.9);
    });

    it('detects XML with declaration', () => {
      const result = detectFormat('<?xml version="1.0"?><root><item>test</item></root>');
      expect(result.format).toBe('xml');
      expect(result.confidence).toBeGreaterThanOrEqual(0.8);
    });

    it('detects XML without declaration', () => {
      const result = detectFormat('<root><item>test</item></root>');
      expect(result.format).toBe('xml');
      expect(result.confidence).toBeGreaterThanOrEqual(0.8);
    });

    it('detects YAML', () => {
      const yaml = 'users:\n  - name: Alice\n    age: 30\n  - name: Bob\n    age: 25';
      const result = detectFormat(yaml);
      expect(result.format).toBe('yaml');
      expect(result.confidence).toBeGreaterThanOrEqual(0.7);
    });

    it('detects CSV', () => {
      const csv = 'name,age,email\nAlice,30,alice@test.com\nBob,25,bob@test.com';
      const result = detectFormat(csv);
      expect(result.format).toBe('csv');
      expect(result.confidence).toBeGreaterThanOrEqual(0.7);
    });

    it('returns null for empty input', () => {
      const result = detectFormat('');
      expect(result.format).toBeNull();
      expect(result.confidence).toBe(0);
    });

    it('returns null for whitespace-only input', () => {
      const result = detectFormat('   \n  \t  ');
      expect(result.format).toBeNull();
      expect(result.confidence).toBe(0);
    });

    it('returns null for plain text', () => {
      const result = detectFormat('Hello world this is just plain text');
      expect(result.format).toBeNull();
    });

    it('returns null for oversized payload', () => {
      const large = 'x'.repeat(11 * 1024 * 1024);
      const result = detectFormat(large);
      expect(result.format).toBeNull();
      expect(result.confidence).toBe(0);
    });

    it('preserves rawText in result', () => {
      const text = '{"key":"value"}';
      const result = detectFormat(text);
      expect(result.rawText).toBe(text);
    });

    it('preserves contentType in result', () => {
      const result = detectFormat('{}', 'application/json');
      expect(result.contentType).toBe('application/json');
    });
  });

  describe('TOML detection', () => {
    it('detects TOML with sections', () => {
      const toml = '[server]\nhost = "localhost"\nport = 8080';
      const result = detectFormat(toml);
      expect(result.format).toBe('toml');
      expect(result.confidence).toBeGreaterThanOrEqual(0.7);
    });
  });
});
