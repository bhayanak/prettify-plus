import type { TreeNodeData } from '@/shared/types';

export function buildTreeFromValue(value: unknown, path: string, depth: number): TreeNodeData[] {
  const nodes: TreeNodeData[] = [];
  const type = getType(value);
  const key = extractKey(path);

  if (type === 'object' && value !== null) {
    const entries = Object.entries(value as Record<string, unknown>);
    nodes.push({
      key,
      value,
      type: 'object',
      path,
      depth,
      childCount: entries.length,
      isExpanded: depth < 3,
    });
    for (const [k, v] of entries) {
      const childPath = `${path}.${k}`;
      nodes.push(...buildTreeFromValue(v, childPath, depth + 1));
    }
  } else if (type === 'array' && Array.isArray(value)) {
    nodes.push({
      key,
      value,
      type: 'array',
      path,
      depth,
      childCount: value.length,
      isExpanded: depth < 3,
    });
    for (let i = 0; i < value.length; i++) {
      const childPath = `${path}[${i}]`;
      nodes.push(...buildTreeFromValue(value[i], childPath, depth + 1));
    }
  } else {
    nodes.push({
      key,
      value,
      type,
      path,
      depth,
      childCount: 0,
      isExpanded: false,
    });
  }

  return nodes;
}

function extractKey(path: string): string {
  const bracketMatch = path.match(/\[(\d+)\]$/);
  if (bracketMatch) return bracketMatch[1];
  const parts = path.split('.');
  return parts[parts.length - 1] || '$';
}

function getType(value: unknown): TreeNodeData['type'] {
  if (value === null || value === undefined) return 'null';
  if (Array.isArray(value)) return 'array';
  switch (typeof value) {
    case 'object':
      return 'object';
    case 'string':
      return 'string';
    case 'number':
      return 'number';
    case 'boolean':
      return 'boolean';
    default:
      return 'string';
  }
}
