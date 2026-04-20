import type { DetectionResult, SupportedFormat } from '@/shared/types';
import { MAX_PAYLOAD_SIZE } from '@/shared/constants';
import * as yaml from 'js-yaml';
import { XMLParser } from 'fast-xml-parser';
import * as TOML from '@iarna/toml';
import Papa from 'papaparse';

function tryJSON(text: string): boolean {
  try {
    JSON.parse(text);
    return true;
  } catch {
    return false;
  }
}

function tryXML(text: string): boolean {
  try {
    const parser = new XMLParser({ ignoreAttributes: false });
    const result = parser.parse(text);
    return result !== undefined && typeof result === 'object' && Object.keys(result).length > 0;
  } catch {
    return false;
  }
}

function tryYAML(text: string): boolean {
  try {
    const result = yaml.load(text);
    // yaml.load can parse plain strings too; require object/array result
    return result !== null && typeof result === 'object';
  } catch {
    return false;
  }
}

function tryTOML(text: string): boolean {
  try {
    TOML.parse(text);
    return true;
  } catch {
    return false;
  }
}

function tryCSV(text: string): boolean {
  try {
    const result = Papa.parse(text, { header: true, preview: 5 });
    // Need at least 2 rows and 2 columns to be considered CSV
    return (
      result.data.length >= 2 &&
      result.meta.fields !== undefined &&
      result.meta.fields.length >= 2 &&
      result.errors.length === 0
    );
  } catch {
    return false;
  }
}

function formatFromContentType(contentType: string): SupportedFormat | null {
  const ct = contentType.toLowerCase();
  if (ct.includes('application/json') || ct.includes('text/json')) return 'json';
  if (ct.includes('application/yaml') || ct.includes('text/yaml')) return 'yaml';
  if (ct.includes('application/xml') || ct.includes('text/xml')) return 'xml';
  if (ct.includes('application/toml') || ct.includes('text/toml')) return 'toml';
  if (ct.includes('text/csv')) return 'csv';
  return null;
}

export function detectFormat(text: string, contentType?: string): DetectionResult {
  if (text.length > MAX_PAYLOAD_SIZE) {
    return { format: null, confidence: 0, rawText: text, contentType };
  }

  // 1. Check Content-Type header first
  if (contentType) {
    const ctFormat = formatFromContentType(contentType);
    if (ctFormat) {
      return { format: ctFormat, confidence: 1.0, contentType, rawText: text };
    }
  }

  const trimmed = text.trim();
  if (!trimmed) {
    return { format: null, confidence: 0, rawText: text, contentType };
  }

  // 2. Try parsing in order of likelihood
  if ((trimmed.startsWith('{') || trimmed.startsWith('[')) && tryJSON(trimmed)) {
    return { format: 'json', confidence: 0.95, rawText: text, contentType };
  }

  if ((trimmed.startsWith('<?xml') || trimmed.startsWith('<')) && tryXML(trimmed)) {
    return { format: 'xml', confidence: 0.9, rawText: text, contentType };
  }

  if (tryTOML(trimmed)) {
    return { format: 'toml', confidence: 0.8, rawText: text, contentType };
  }

  if (trimmed.includes(',') && trimmed.includes('\n') && tryCSV(trimmed)) {
    return { format: 'csv', confidence: 0.75, rawText: text, contentType };
  }

  // YAML last — it's very permissive
  if (tryYAML(trimmed)) {
    return { format: 'yaml', confidence: 0.7, rawText: text, contentType };
  }

  return { format: null, confidence: 0, rawText: text, contentType };
}
