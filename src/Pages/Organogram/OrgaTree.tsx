"use client";

import React, { useCallback } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  addEdge,
  useEdgesState,
  useNodesState,
  Handle,
  Position,
  Node,
  Edge,
} from "reactflow";
import "reactflow/dist/style.css";
import Image, { StaticImageData } from "next/image";
import img from "../../assests/images/emeka.png"; // Replace with actual staff photos if available

// ---------------- TYPES ----------------
type StaffData = {
  name: string;
  role: string;
  department: string;
  location: string;
  photo: string | StaticImageData;
};

type DeptData = {
  label: string;
  borderColor: string;
  bgColor: string;
  btnColor: string;
};

// Node unions
type StaffNode = Node<StaffData, "staffCard">;
type DeptNode = Node<DeptData, "deptCard">;
type OrgNode = StaffNode | DeptNode;

// ---------------- NODE COMPONENTS ----------------
const StaffCard = ({ data }: { data: StaffData }) => (
  <div className="relative w-44 p-3 pt-8 bg-white border rounded-xl shadow text-center">
    {/* Avatar */}
    <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
      <Image
        src={data.photo}
        alt={data.name}
        width={50}
        height={50}
        className="rounded-full border-2 border-white shadow-md"
      />
    </div>

    {/* Name & Role */}
    <h3 className="mt-6 font-semibold text-sm">{data.name}</h3>
    <p className="text-xs text-gray-600">{data.role}</p>

    {/* Department Badge */}
    <button className="mt-2 text-xs bg-gray-200 rounded-full px-2 py-0.5">
      {data.department}
    </button>

    {/* Location */}
    <p className="text-[10px] text-gray-500 mt-1">{data.location}</p>

    {/* React Flow Handles */}
    <Handle type="target" position={Position.Top} />
    <Handle type="source" position={Position.Bottom} />
  </div>
);

const DeptCard = ({ data }: { data: DeptData }) => (
  <div
    className="w-32 p-2 rounded-lg text-center border shadow-sm"
    style={{
      borderColor: data.borderColor,
      backgroundColor: data.bgColor,
    }}
  >
    <button
      className="px-2 py-1 rounded-full text-xs text-white"
      style={{ backgroundColor: data.btnColor }}
    >
      {data.label}
    </button>

    <Handle type="source" position={Position.Bottom} />
    <Handle type="target" position={Position.Top} />
  </div>
);

const nodeTypes = {
  staffCard: StaffCard,
  deptCard: DeptCard,
};

// ---------------- NODES (Matches FIGMA DESIGN) ----------------
const initialNodes: OrgNode[] = [
  {
    id: "ceo",
    type: "staffCard",
    position: { x: 500, y: 0 },
    data: {
      name: "Emeka Okafor",
      role: "CEO",
      department: "Procurement",
      location: "Maryland, USA",
      photo: img,
    },
  },
  {
    id: "hr",
    type: "staffCard",
    position: { x: 200, y: 200 },
    data: {
      name: "Sarah Johnson",
      role: "Hiring Manager",
      department: "HR",
      location: "Maryland, USA",
      photo: img,
    },
  },
  {
    id: "technical",
    type: "staffCard",
    position: { x: 400, y: 200 },
    data: {
      name: "James Williams",
      role: "Technical",
      department: "Procurement",
      location: "Maryland, USA",
      photo: img,
    },
  },
  {
    id: "cto",
    type: "staffCard",
    position: { x: 600, y: 200 },
    data: {
      name: "Ben Thompson",
      role: "CTO",
      department: "Technical",
      location: "Maryland, USA",
      photo: img,
    },
  },
  {
    id: "coo",
    type: "staffCard",
    position: { x: 800, y: 200 },
    data: {
      name: "Ben Thompson",
      role: "COO",
      department: "Operations",
      location: "Maryland, USA",
      photo: img,
    },
  },

  // ---- CTO DEPARTMENTS ----
  {
    id: "frontend",
    type: "deptCard",
    position: { x: 550, y: 400 },
    data: {
      label: "Frontend Dev",
      borderColor: "#EEF4FF",
      bgColor: "#ffffff",
      btnColor: "#6172F3",
    },
  },
  {
    id: "backend",
    type: "deptCard",
    position: { x: 650, y: 400 },
    data: {
      label: "Backend Dev",
      borderColor: "#EEF4FF",
      bgColor: "#ffffff",
      btnColor: "#6172F3",
    },
  },
  {
    id: "mobile",
    type: "deptCard",
    position: { x: 750, y: 400 },
    data: {
      label: "Mobile Dev",
      borderColor: "#EEF4FF",
      bgColor: "#ffffff",
      btnColor: "#6172F3",
    },
  },
  {
    id: "projects",
    type: "deptCard",
    position: { x: 850, y: 400 },
    data: {
      label: "Projects",
      borderColor: "#EEF4FF",
      bgColor: "#ffffff",
      btnColor: "#6172F3",
    },
  },
  {
    id: "qa",
    type: "deptCard",
    position: { x: 950, y: 400 },
    data: {
      label: "Quality Assurance",
      borderColor: "#EEF4FF",
      bgColor: "#ffffff",
      btnColor: "#6172F3",
    },
  },

  // ---- COO DEPARTMENTS ----
  {
    id: "bizOps",
    type: "deptCard",
    position: { x: 600, y: 600 },
    data: {
      label: "Business Ops",
      borderColor: "#FFFAEC",
      bgColor: "#ffffff",
      btnColor: "#FF990C",
    },
  },
  {
    id: "media",
    type: "deptCard",
    position: { x: 700, y: 600 },
    data: {
      label: "Media",
      borderColor: "#FFFAEC",
      bgColor: "#ffffff",
      btnColor: "#FF990C",
    },
  },
  {
    id: "data",
    type: "deptCard",
    position: { x: 800, y: 600 },
    data: {
      label: "Data",
      borderColor: "#FFFAEC",
      bgColor: "#ffffff",
      btnColor: "#FF990C",
    },
  },
  {
    id: "productMarketing",
    type: "deptCard",
    position: { x: 900, y: 600 },
    data: {
      label: "Product & Marketing",
      borderColor: "#FFFAEC",
      bgColor: "#ffffff",
      btnColor: "#FF990C",
    },
  },
  {
    id: "research",
    type: "deptCard",
    position: { x: 1000, y: 600 },
    data: {
      label: "Research Units",
      borderColor: "#FFFAEC",
      bgColor: "#ffffff",
      btnColor: "#FF990C",
    },
  },
];

// ---------------- EDGES ----------------
const initialEdges: Edge[] = [
  { id: "ceo-hr", source: "ceo", target: "hr", type: "smoothstep" },
  { id: "ceo-tech", source: "ceo", target: "technical", type: "smoothstep" },
  { id: "ceo-cto", source: "ceo", target: "cto", type: "smoothstep" },
  { id: "ceo-coo", source: "ceo", target: "coo", type: "smoothstep" },

  // CTO children
  { id: "cto-frontend", source: "cto", target: "frontend", type: "smoothstep" },
  { id: "cto-backend", source: "cto", target: "backend", type: "smoothstep" },
  { id: "cto-mobile", source: "cto", target: "mobile", type: "smoothstep" },
  { id: "cto-projects", source: "cto", target: "projects", type: "smoothstep" },
  { id: "cto-qa", source: "cto", target: "qa", type: "smoothstep" },

  // COO children
  { id: "coo-biz", source: "coo", target: "bizOps", type: "smoothstep" },
  { id: "coo-media", source: "coo", target: "media", type: "smoothstep" },
  { id: "coo-data", source: "coo", target: "data", type: "smoothstep" },
  {
    id: "coo-prod",
    source: "coo",
    target: "productMarketing",
    type: "smoothstep",
  },
  { id: "coo-research", source: "coo", target: "research", type: "smoothstep" },
];

// ---------------- MAIN COMPONENT ----------------
export default function OrgChart() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);

  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>(initialEdges);

  const onConnect = useCallback(
    (params: any) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  return (
    <div style={{ width: "100%", height: "150vh" }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
      >
        <MiniMap />
        <Controls />
        <Background gap={12} color="#f3f3f3" />
      </ReactFlow>
    </div>
  );
}
// "use client";
// import React from "react";

// const OrgChart = () => {
//   return <div>OrgaTree</div>;
// };

// export default OrgChart;
