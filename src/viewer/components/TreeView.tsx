import type { TreeNodeData } from '@/shared/types';

interface TreeViewProps {
  nodes: TreeNodeData[];
  expandedPaths: Set<string>;
  onToggle: (path: string) => void;
  onSelect: (path: string) => void;
}

export function TreeView({ nodes, expandedPaths, onToggle, onSelect }: TreeViewProps) {
  // Filter visible nodes based on expansion state
  const visibleNodes = getVisibleNodes(nodes, expandedPaths);

  return (
    <div className="tree-container">
      {visibleNodes.map((node) => (
        <TreeNode
          key={node.path}
          node={node}
          isExpanded={expandedPaths.has(node.path)}
          onToggle={onToggle}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}

interface TreeNodeProps {
  node: TreeNodeData;
  isExpanded: boolean;
  onToggle: (path: string) => void;
  onSelect: (path: string) => void;
}

function TreeNode({ node, isExpanded, onToggle, onSelect }: TreeNodeProps) {
  const indent = node.depth * 20;
  const hasChildren = node.childCount > 0;

  const handleClick = () => {
    if (hasChildren) {
      onToggle(node.path);
    }
    onSelect(node.path);
  };

  return (
    <div className="tree-node" style={{ paddingLeft: indent }} onClick={handleClick}>
      <span className="tree-toggle">{hasChildren ? (isExpanded ? '▾' : '▸') : ' '}</span>
      <span className="tree-key">{node.key}</span>
      {hasChildren ? (
        <span style={{ marginLeft: 4, color: 'var(--text-secondary)', fontSize: '0.85em' }}>
          {node.type === 'array' ? `[${node.childCount}]` : `{${node.childCount}}`}
        </span>
      ) : (
        <>
          <span style={{ margin: '0 4px', color: 'var(--text-secondary)' }}>:</span>
          <ValueDisplay value={node.value} type={node.type} />
        </>
      )}
    </div>
  );
}

function ValueDisplay({ value, type }: { value: unknown; type: TreeNodeData['type'] }) {
  switch (type) {
    case 'string':
      return <span className="tree-string">&quot;{String(value)}&quot;</span>;
    case 'number':
      return <span className="tree-number">{String(value)}</span>;
    case 'boolean':
      return <span className="tree-boolean">{String(value)}</span>;
    case 'null':
      return <span className="tree-null">null</span>;
    default:
      return <span>{String(value)}</span>;
  }
}

function getVisibleNodes(nodes: TreeNodeData[], expandedPaths: Set<string>): TreeNodeData[] {
  const visible: TreeNodeData[] = [];
  const collapsedAncestors: string[] = [];

  for (const node of nodes) {
    // Check if any ancestor is collapsed
    const isHidden = collapsedAncestors.some(
      (ancestor) => node.path.startsWith(ancestor) && node.path !== ancestor,
    );

    if (isHidden) continue;

    visible.push(node);

    // If this node has children and is NOT expanded, track it as collapsed
    if (node.childCount > 0 && !expandedPaths.has(node.path)) {
      collapsedAncestors.push(node.path);
    }
  }

  return visible;
}
