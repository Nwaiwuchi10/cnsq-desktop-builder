// "use client";
// import OrgCard from "./OrgCard";

// interface Node {
//   id: string;
//   name: string;
//   role: string;
//   department: string;
//   location: string;
//   photo?: any;
//   children?: Node[];
// }

// export default function OrgTree({ node }: { node: Node }) {
//   // CEO card
//   return (
//     <div className="flex flex-col items-center relative">
//       {/* CEO */}
//       <OrgCard
//         name={node.name}
//         role={node.role}
//         department={node.department}
//         location={node.location}
//         photo={node.photo}
//       />

//       {/* CEO down line */}
//       {node.children && <div className="w-px h-10 bg-gray-500"></div>}

//       {/* CEO children row (HR, Technical, CTO, COO) */}
//       {node.children && (
//         <div className="relative w-full flex justify-center">
//           {/* Horizontal line */}
//           <div className="absolute top-0 left-0 right-0 h-px bg-gray-500"></div>

//           <div className="flex gap-6 mt-0 flex-wrap justify-center">
//             {node.children.map((child) => {
//               const isCTO = child.role.includes("Technical Officer");
//               const isCOO = child.role.includes("Operations Officer");

//               return (
//                 <div
//                   key={child.id}
//                   className="flex flex-col items-center relative"
//                 >
//                   {/* vertical line into child */}
//                   <div className="w-px h-6 bg-gray-500"></div>

//                   {/* child card (full info) */}
//                   <OrgCard
//                     name={child.name}
//                     role={child.role}
//                     department={child.department}
//                     location={child.location}
//                     photo={child.photo}
//                   />

//                   {/* children under CTO / COO */}
//                   {child.children && child.children.length > 0 && (
//                     <div className="flex flex-col mt-4 gap-3">
//                       {child.children.map((grand) => (
//                         <OrgCard
//                           key={grand.id}
//                           name={grand.name}
//                           role={grand.role}
//                           department={grand.department}
//                           location={grand.location}
//                           photo={grand.photo}
//                           type={
//                             isCTO
//                               ? "cto-child"
//                               : isCOO
//                               ? "coo-child"
//                               : "default"
//                           }
//                         />
//                       ))}
//                     </div>
//                   )}
//                 </div>
//               );
//             })}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }
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
import img from "../../assests/images/ezinne.jpg"; // replace with your CEO image

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
  <div className="w-40 p-3 bg-white border rounded-xl shadow text-center">
    <div className="flex justify-center mb-2">
      <Image
        src={data.photo}
        alt={data.name}
        width={50}
        height={50}
        className="rounded-full border"
      />
    </div>
    <h3 className="font-semibold text-sm">{data.name}</h3>
    <p className="text-xs text-gray-600">{data.role}</p>
    <button className="mt-2 text-xs bg-gray-200 rounded-full px-2">
      {data.department}
    </button>
    <p className="text-[10px] text-gray-500 mt-1">{data.location}</p>

    <Handle type="source" position={Position.Bottom} />
    <Handle type="target" position={Position.Top} />
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

// ---------------- NODES ----------------
const initialNodes: OrgNode[] = [
  {
    id: "ceo",
    type: "staffCard",
    position: { x: 350, y: 0 },
    data: {
      name: "John Doe",
      role: "Chief Executive Officer",
      department: "Management",
      location: "Head Office",
      photo: img,
    },
  },
  {
    id: "hr",
    type: "staffCard",
    position: { x: 0, y: 200 },
    data: {
      name: "Jane Smith",
      role: "HR Hiring Manager",
      department: "HR",
      location: "Lagos",
      photo: img,
    },
  },
  {
    id: "technical",
    type: "staffCard",
    position: { x: 250, y: 200 },
    data: {
      name: "Michael Lee",
      role: "Technical Procurement",
      department: "Procurement",
      location: "Abuja",
      photo: img,
    },
  },
  {
    id: "cto",
    type: "staffCard",
    position: { x: 500, y: 200 },
    data: {
      name: "David Brown",
      role: "CTO",
      department: "Tech",
      location: "Lagos",
      photo: img,
    },
  },
  {
    id: "coo",
    type: "staffCard",
    position: { x: 750, y: 200 },
    data: {
      name: "Robert Taylor",
      role: "COO",
      department: "Operations",
      location: "Head Office",
      photo: img,
    },
  },
  // ---- CTO Children ----
  {
    id: "frontend",
    type: "deptCard",
    position: { x: 450, y: 400 },
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
    position: { x: 550, y: 400 },
    data: {
      label: "Backend Dev",
      borderColor: "#EEF4FF",
      bgColor: "#ffffff",
      btnColor: "#6172F3",
    },
  },
  {
    id: "qa",
    type: "deptCard",
    position: { x: 650, y: 400 },
    data: {
      label: "QA",
      borderColor: "#EEF4FF",
      bgColor: "#ffffff",
      btnColor: "#6172F3",
    },
  },
  // ---- COO Children ----
  {
    id: "biz",
    type: "deptCard",
    position: { x: 700, y: 400 },
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
    position: { x: 800, y: 400 },
    data: {
      label: "Media & Data",
      borderColor: "#FFFAEC",
      bgColor: "#ffffff",
      btnColor: "#FF990C",
    },
  },
];

// ---------------- EDGES ----------------
const initialEdges: Edge[] = [
  { id: "e1-hr", source: "ceo", target: "hr", type: "smoothstep" },
  { id: "e1-tech", source: "ceo", target: "technical", type: "smoothstep" },
  { id: "e1-cto", source: "ceo", target: "cto", type: "smoothstep" },
  { id: "e1-coo", source: "ceo", target: "coo", type: "smoothstep" },
  {
    id: "e-cto-frontend",
    source: "cto",
    target: "frontend",
    type: "smoothstep",
  },
  { id: "e-cto-backend", source: "cto", target: "backend", type: "smoothstep" },
  { id: "e-cto-qa", source: "cto", target: "qa", type: "smoothstep" },
  { id: "e-coo-biz", source: "coo", target: "biz", type: "smoothstep" },
  { id: "e-coo-media", source: "coo", target: "media", type: "smoothstep" },
];

// ---------------- MAIN COMPONENT ----------------
export default function OrgChart() {
  const [nodes, setNodes, onNodesChange] = useNodesState<OrgNode>(initialNodes);

  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>(initialEdges);

  const onConnect = useCallback(
    (params: any) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  return (
    <div style={{ width: "100%", height: "100vh" }}>
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
