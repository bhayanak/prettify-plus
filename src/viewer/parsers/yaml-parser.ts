import * as yaml from 'js-yaml';
import type { TreeNodeData } from '@/shared/types';
import { buildTreeFromValue } from './tree-builder';

export function parseYAML(text: string): { data: unknown; nodes: TreeNodeData[] } {
  const data = yaml.load(text);
  const nodes = buildTreeFromValue(data, '$', 0);
  return { data, nodes };
}
