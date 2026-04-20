import * as TOML from '@iarna/toml';
import type { TreeNodeData } from '@/shared/types';
import { buildTreeFromValue } from './tree-builder';

export function parseTOML(text: string): { data: unknown; nodes: TreeNodeData[] } {
  const data = TOML.parse(text);
  const nodes = buildTreeFromValue(data as unknown, '$', 0);
  return { data, nodes };
}
