import Papa from 'papaparse';
import type { TreeNodeData } from '@/shared/types';
import { buildTreeFromValue } from './tree-builder';

export function parseCSV(text: string): { data: unknown; nodes: TreeNodeData[] } {
  const result = Papa.parse(text, { header: true, dynamicTyping: true, skipEmptyLines: true });
  const data = result.data;
  const nodes = buildTreeFromValue(data, '$', 0);
  return { data, nodes };
}
