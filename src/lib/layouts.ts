import type { MindMapNode, MindMapEdge, LayoutMode } from '@/types';

// ── Layout constants ────────────────────────────────────────────────

const RADIAL_RING_SPACING = 200;
const RADIAL_MIN_NODE_ARC = 80;

const TREE_LEVEL_SPACING = 120;
const TREE_SIBLING_SPACING = 40;
const TREE_NODE_WIDTH = 180;

// ── Internal tree structure ─────────────────────────────────────────

interface TreeNode {
  id: string;
  children: TreeNode[];
  subtreeLeafCount: number;
}

function buildTree(
  nodes: MindMapNode[],
  edges: MindMapEdge[],
): TreeNode | null {
  // Find root (node with no parentId)
  const root = nodes.find((n) => !n.data.parentId);
  if (!root) return null;

  // Build adjacency: source → targets
  const childMap = new Map<string, string[]>();
  for (const edge of edges) {
    const children = childMap.get(edge.source);
    if (children) children.push(edge.target);
    else childMap.set(edge.source, [edge.target]);
  }

  const nodeSet = new Set(nodes.map((n) => n.id));

  function build(id: string): TreeNode {
    const childIds = (childMap.get(id) ?? []).filter((cid) => nodeSet.has(cid));
    const children = childIds.map((cid) => build(cid));
    const subtreeLeafCount =
      children.length === 0
        ? 1
        : children.reduce((sum, c) => sum + c.subtreeLeafCount, 0);
    return { id, children, subtreeLeafCount };
  }

  return build(root.id);
}

// ── Radial layout ───────────────────────────────────────────────────

function computeRadialLayout(
  nodes: MindMapNode[],
  edges: MindMapEdge[],
): MindMapNode[] {
  const tree = buildTree(nodes, edges);
  if (!tree) return nodes;

  const positionMap = new Map<string, { x: number; y: number }>();
  positionMap.set(tree.id, { x: 0, y: 0 });

  function layoutSubtree(
    treeNode: TreeNode,
    depth: number,
    startAngle: number,
    endAngle: number,
  ) {
    const radius = depth * RADIAL_RING_SPACING;
    const totalLeaves = treeNode.subtreeLeafCount || 1;
    let currentAngle = startAngle;

    for (const child of treeNode.children) {
      const childLeaves = child.subtreeLeafCount || 1;
      const childSweep =
        ((endAngle - startAngle) * childLeaves) / totalLeaves;

      // Enforce minimum arc spacing
      const minSweep =
        radius > 0 ? RADIAL_MIN_NODE_ARC / radius : childSweep;
      const actualSweep = Math.max(childSweep, minSweep);

      const midAngle = currentAngle + actualSweep / 2;
      positionMap.set(child.id, {
        x: Math.cos(midAngle) * radius,
        y: Math.sin(midAngle) * radius,
      });

      layoutSubtree(child, depth + 1, currentAngle, currentAngle + actualSweep);
      currentAngle += actualSweep;
    }
  }

  layoutSubtree(tree, 1, 0, 2 * Math.PI);

  return nodes.map((n) => ({
    ...n,
    position: positionMap.get(n.id) ?? n.position,
  }));
}

// ── Tree layout ─────────────────────────────────────────────────────

function computeTreeLayout(
  nodes: MindMapNode[],
  edges: MindMapEdge[],
): MindMapNode[] {
  const tree = buildTree(nodes, edges);
  if (!tree) return nodes;

  const positionMap = new Map<string, { x: number; y: number }>();

  // Bottom-up: compute subtree widths
  const widthCache = new Map<string, number>();

  function getSubtreeWidth(treeNode: TreeNode): number {
    const cached = widthCache.get(treeNode.id);
    if (cached !== undefined) return cached;

    if (treeNode.children.length === 0) {
      widthCache.set(treeNode.id, TREE_NODE_WIDTH);
      return TREE_NODE_WIDTH;
    }

    const childrenWidth = treeNode.children.reduce(
      (sum, c) => sum + getSubtreeWidth(c),
      0,
    );
    const width =
      childrenWidth +
      TREE_SIBLING_SPACING * (treeNode.children.length - 1);
    widthCache.set(treeNode.id, width);
    return width;
  }

  // Top-down: assign positions
  function assignPositions(
    treeNode: TreeNode,
    depth: number,
    leftX: number,
  ) {
    const width = getSubtreeWidth(treeNode);
    const centerX = leftX + width / 2;
    positionMap.set(treeNode.id, {
      x: centerX,
      y: depth * TREE_LEVEL_SPACING,
    });

    let childLeft = leftX;
    for (const child of treeNode.children) {
      const childWidth = getSubtreeWidth(child);
      assignPositions(child, depth + 1, childLeft);
      childLeft += childWidth + TREE_SIBLING_SPACING;
    }
  }

  const totalWidth = getSubtreeWidth(tree);
  assignPositions(tree, 0, -totalWidth / 2);

  return nodes.map((n) => ({
    ...n,
    position: positionMap.get(n.id) ?? n.position,
  }));
}

// ── Dispatcher ──────────────────────────────────────────────────────

export function applyLayout(
  layoutMode: LayoutMode,
  nodes: MindMapNode[],
  edges: MindMapEdge[],
): MindMapNode[] {
  if (layoutMode === 'radial') return computeRadialLayout(nodes, edges);
  if (layoutMode === 'tree') return computeTreeLayout(nodes, edges);
  return nodes; // free — no-op
}
