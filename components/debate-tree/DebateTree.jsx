'use client';

import { useCallback, useEffect } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import DebateNodeComponent from './DebateNode';

const nodeTypes = { debate: DebateNodeComponent };

const EDGE_COLORS = {
  advocate: '#06b6d4',
  critic: '#ec4899',
  judge: '#a855f7',
  research: '#3b82f6',
  fork: '#f59e0b',
  verdict: '#6366f1',
};

const MINIMAP_COLORS = {
  advocate: '#06b6d4',
  critic: '#ec4899',
  judge: '#a855f7',
  research: '#3b82f6',
  fork: '#f59e0b',
  verdict: '#6366f1',
};

export default function DebateTree({ debate, onFork }) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  useEffect(() => {
    if (!debate) return;

    // Get current branch nodes
    let branchNodes;
    if (debate.currentBranchId === 'main') {
      branchNodes = debate.nodes || [];
    } else {
      const branch = debate.branches?.find(b => b.id === debate.currentBranchId);
      branchNodes = branch?.nodes || debate.nodes || [];
    }

    const flowNodes = [];
    const flowEdges = [];

    branchNodes.forEach((node, index) => {
      // Layout: vertical with slight horizontal offset for different types
      const typeOffsets = { advocate: -50, critic: 50, judge: 0, research: 0, fork: 100, verdict: 0 };
      const xOffset = typeOffsets[node.type] || 0;

      flowNodes.push({
        id: node.id,
        type: 'debate',
        position: { x: 200 + xOffset, y: index * 220 },
        data: {
          ...node,
          onFork: onFork ? () => onFork(node.id) : undefined,
        },
      });

      if (node.parentId) {
        flowEdges.push({
          id: `e-${node.parentId}-${node.id}`,
          source: node.parentId,
          target: node.id,
          animated: true,
          style: {
            stroke: EDGE_COLORS[node.type] || '#6b7280',
            strokeWidth: 2,
          },
        });
      }
    });

    setNodes(flowNodes);
    setEdges(flowEdges);
  }, [debate, setNodes, setEdges, onFork]);

  const minimapNodeColor = useCallback((node) => {
    return MINIMAP_COLORS[node.data?.type] || '#6b7280';
  }, []);

  if (!debate || (debate.nodes?.length === 0 && debate.branches?.length === 0)) {
    return (
      <div className="flex items-center justify-center h-[400px] text-gray-500">
        <p>No nodes yet. Run a debate round to visualize the tree.</p>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: '600px' }} className="rounded-xl overflow-hidden">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.3 }}
        attributionPosition="bottom-left"
        defaultEdgeOptions={{ animated: true, style: { strokeWidth: 2 } }}
        proOptions={{ hideAttribution: true }}
      >
        <Background variant="dots" gap={20} size={1} color="#ffffff" className="opacity-10" />
        <Controls />
        <MiniMap
          nodeColor={minimapNodeColor}
          maskColor="rgba(0, 0, 0, 0.5)"
        />
      </ReactFlow>
    </div>
  );
}
