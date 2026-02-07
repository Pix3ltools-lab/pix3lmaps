import type { MindMapNode, MindMapEdge, LayoutMode } from '@/types';
import {
  DEFAULT_NODE_COLOR,
  DEFAULT_NODE_SHAPE,
  DEFAULT_TEXT_SIZE,
  DEFAULT_ROOT_LABEL,
} from '@/lib/constants';

export interface MapTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  layoutMode: LayoutMode;
  nodes: MindMapNode[];
  edges: MindMapEdge[];
}

function rootNode(label: string = DEFAULT_ROOT_LABEL): MindMapNode {
  return {
    id: 'root',
    type: 'mindmap',
    position: { x: 0, y: 0 },
    data: {
      label,
      color: DEFAULT_NODE_COLOR,
      shape: DEFAULT_NODE_SHAPE,
      fontSize: DEFAULT_TEXT_SIZE,
    },
  };
}

function childNode(
  id: string,
  label: string,
  color: string,
  shape: 'rectangle' | 'pill' | 'diamond' = 'rectangle',
): MindMapNode {
  return {
    id,
    type: 'mindmap',
    position: { x: 0, y: 0 },
    data: {
      label,
      color,
      shape,
      fontSize: DEFAULT_TEXT_SIZE,
      parentId: 'root',
    },
  };
}

function edge(childId: string): MindMapEdge {
  return { id: `root-${childId}`, source: 'root', target: childId };
}

export const TEMPLATES: MapTemplate[] = [
  {
    id: 'blank',
    name: 'Blank Map',
    description: 'Start from scratch with a single root node',
    icon: '📄',
    layoutMode: 'free',
    nodes: [rootNode()],
    edges: [],
  },
  {
    id: 'swot',
    name: 'SWOT Analysis',
    description: 'Strengths, Weaknesses, Opportunities, Threats',
    icon: '📊',
    layoutMode: 'tree',
    nodes: [
      rootNode('SWOT Analysis'),
      childNode('s', 'Strengths', '#2ECC71'),
      childNode('w', 'Weaknesses', '#E74C3C'),
      childNode('o', 'Opportunities', '#3498DB'),
      childNode('t', 'Threats', '#E67E22'),
    ],
    edges: [edge('s'), edge('w'), edge('o'), edge('t')],
  },
  {
    id: 'pros-cons',
    name: 'Pros & Cons',
    description: 'Weigh the positives and negatives',
    icon: '⚖️',
    layoutMode: 'tree',
    nodes: [
      rootNode('Decision'),
      childNode('pros', 'Pros', '#2ECC71'),
      childNode('cons', 'Cons', '#E74C3C'),
    ],
    edges: [edge('pros'), edge('cons')],
  },
  {
    id: 'project-plan',
    name: 'Project Plan',
    description: 'Planning, Execution, and Review phases',
    icon: '📋',
    layoutMode: 'tree',
    nodes: [
      rootNode('Project'),
      childNode('planning', 'Planning', '#3498DB'),
      childNode('execution', 'Execution', '#E67E22'),
      childNode('review', 'Review', '#2ECC71'),
    ],
    edges: [edge('planning'), edge('execution'), edge('review')],
  },
  {
    id: 'weekly-planner',
    name: 'Weekly Planner',
    description: 'Organize your week day by day',
    icon: '📅',
    layoutMode: 'tree',
    nodes: [
      rootNode('This Week'),
      childNode('mon', 'Monday', '#3498DB'),
      childNode('tue', 'Tuesday', '#2ECC71'),
      childNode('wed', 'Wednesday', '#E67E22'),
      childNode('thu', 'Thursday', '#9B59B6'),
      childNode('fri', 'Friday', '#E74C3C'),
      childNode('sat', 'Saturday', '#1ABC9C'),
      childNode('sun', 'Sunday', '#D4AF37'),
    ],
    edges: [
      edge('mon'),
      edge('tue'),
      edge('wed'),
      edge('thu'),
      edge('fri'),
      edge('sat'),
      edge('sun'),
    ],
  },
  {
    id: 'brainstorm',
    name: 'Brainstorm',
    description: 'Capture ideas freely in all directions',
    icon: '💡',
    layoutMode: 'tree',
    nodes: [
      rootNode('Topic'),
      childNode('i1', 'Idea 1', '#E67E22', 'pill'),
      childNode('i2', 'Idea 2', '#9B59B6', 'pill'),
      childNode('i3', 'Idea 3', '#2ECC71', 'pill'),
      childNode('i4', 'Idea 4', '#E74C3C', 'pill'),
    ],
    edges: [edge('i1'), edge('i2'), edge('i3'), edge('i4')],
  },
  {
    id: 'meeting-notes',
    name: 'Meeting Notes',
    description: 'Agenda, Discussion, and Action Items',
    icon: '📝',
    layoutMode: 'tree',
    nodes: [
      rootNode('Meeting'),
      childNode('agenda', 'Agenda', '#3498DB'),
      childNode('discussion', 'Discussion', '#F39C12'),
      childNode('actions', 'Action Items', '#2ECC71'),
    ],
    edges: [edge('agenda'), edge('discussion'), edge('actions')],
  },
];
