'use client';

import { useCallback, useMemo } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import DebateNode from './DebateNode';

const nodeTypes = {
  debate: DebateNode,
};

/**
 * @typedef {import('@/lib/types.js').DebateTree} DebateTree
 * @typedef {import('@/lib/types.js').DebateNode} DebateNode
 */

export default function DebateTree({ debate, onNodeClick, onFork }) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // Convert debate nodes to React Flow nodes
  useMemo(() => {
    if (!debate) return;

    const flowNodes = [];
    const flowEdges = [];

    // Get current branch nodes
    const branch = debate.branches.find(b => b.id === debate.currentBranchId) || {
      id: 'main',
      nodes: debate.nodes,
    };

    branch.nodes.forEach((node, index) => {
      const position = calculatePosition(node, index, branch.nodes);

      flowNodes.push({
        id: node.id,
        type: 'debate',
        position,
        data: {
          ...node,
          onFork: () => onFork?.(node.id),
        },
      });

      // Add edge from parent
      if (node.parentId) {
        flowEdges.push({
          id: `e${node.parentId}-${node.id}`,
          source: node.parentId,
          target: node.id,
          animated: true,
          style: { stroke: getEdgeColor(node.type) },
        });
      }
    });

    setNodes(flowNodes);
    setEdges(flowEdges);
  }, [debate, setNodes, setEdges, onFork]);

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  return (
    <div style={{ width: '100%', height: '600px' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        attributionPosition="bottom-left"
      >
        <Background />
        <Controls />
        <MiniMap />
      </ReactFlow>
    </div>
  );
}

/**
 * Calculate node position in tree layout
 * @param {DebateNode} node
 * @param {number} index
 * @param {DebateNode[]} allNodes
 * @returns {{x: number, y: number}}
 */
function calculatePosition(node, index, allNodes) {
  // Simple horizontal layout
  const x = index * 300;
  const y = getDepth(node, allNodes) * 200;

  return { x, y };
}

/**
 * Get depth of node in tree
 * @param {DebateNode} node
 * @param {DebateNode[]} allNodes
 * @returns {number}
 */
function getDepth(node, allNodes) {
  if (!node.parentId) return 0;

  const parent = allNodes.find(n => n.id === node.parentId);
  if (!parent) return 0;

  return 1 + getDepth(parent, allNodes);
}

/**
 * Get edge color based on node type
 * @param {string} nodeType
 * @returns {string}
 */
function getEdgeColor(nodeType) {
  const colors = {
    advocate: '#10b981', // green
    critic: '#ef4444',    // red
    judge: '#3b82f6',     // blue
    research: '#8b5cf6',  // purple
    fork: '#f59e0b',      // amber
    verdict: '#6366f1',   // indigo
  };

  return colors[nodeType] || '#6b7280';
}
