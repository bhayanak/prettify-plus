import { XMLParser } from 'fast-xml-parser';
import type { TreeNodeData } from '@/shared/types';
import { buildTreeFromValue } from './tree-builder';

export function parseXML(text: string): { data: unknown; nodes: TreeNodeData[] } {
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
    textNodeName: '#text',
  });
  const data = parser.parse(text);
  const nodes = buildTreeFromValue(data, '$', 0);
  return { data, nodes };
}
