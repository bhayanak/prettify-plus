import type { TreeNodeData } from '@/shared/types';

export function parseJSON(text: string): { data: unknown; nodes: TreeNodeData[] } {
  const data = JSON.parse(text);
  const nodes = buildTree(data, '$', 0);
  return { data, nodes };
}

function buildTree(value: unknown, path: string, depth: number): TreeNodeData[] {
  const nodes: TreeNodeData[] = [];
  const type = getType(value);
  const key = path.split('.').pop() || '$';

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
      nodes.push(...buildTree(v, childPath, depth + 1));
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
      nodes.push(...buildTree(value[i], childPath, depth + 1));
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

function getType(value: unknown): TreeNodeData['type'] {
  if (value === null) return 'null';
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
