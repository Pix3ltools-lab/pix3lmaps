import type { Node, Edge } from '@xyflow/react';

export type NodeShape = 'rectangle' | 'pill' | 'diamond';

export type LayoutMode = 'radial' | 'tree' | 'free';

export type TextSize = 'small' | 'medium' | 'large';

export type MindMapNodeData = {
  label: string;
  color: string;
  shape: NodeShape;
  fontSize: TextSize;
  image?: string;
  comment?: string;
  url?: string;
  icon?: string;
  parentId?: string;
  [key: string]: unknown;
};

export type MindMapNode = Node<MindMapNodeData, 'mindmap'>;

export type MindMapEdge = Edge;

export interface MindMapData {
  id?: number;
  name: string;
  thumbnail?: string;
  nodes: MindMapNode[];
  edges: MindMapEdge[];
  layoutMode: LayoutMode;
  createdAt: Date;
  updatedAt: Date;
}

export type SavedMindMapData = MindMapData & { id: number };
