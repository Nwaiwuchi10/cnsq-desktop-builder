"use client";

import React, { useCallback, useState } from "react";
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
import img from "../../assests/images/ceo.jpg";
import img2 from "../../assests/images/emeka.png"; // Replace with actual staff photos
import StaffDirectoryModal from "../../component/StaffDirectoryModal/StaffDirectoryModal";
import Api from "@/utils/api";

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

type StaffNode = Node<StaffData, "staffCard">;
type DeptNode = Node<DeptData, "deptCard">;
type OrgNode = Node<StaffData | DeptData, "staffCard" | "deptCard">;

// type OrgNode = StaffNode | DeptNode;

// ---------------- NODE COMPONENTS ----------------

const StaffCard = ({ data }: { data: StaffData }) => {
  const isCEO = data.role === "CEO";
  const isHR = data.role === "Hiring Manager";
  const isTech = data.role === "Technicalr";
  const isCTO = data.role === "CTO";
  const isCOO = data.role === "COO";

  return (
    <>
      <div
        className={`relative w-48 p-4 rounded-2xl shadow-md flex flex-col items-center text-center ${
          isCEO ? "bg-[#F9FFE6] border border-lime-300" : "bg-white border"
        },${isHR ? "bg-[#FAFAFF] border border-[#6938EF]" : "bg-white border"}
        ,${isTech ? "bg-[#FEF6FB] border border-[#F670C7]" : "bg-white border"}
        ,${isCTO ? "bg-[#EEF4FF] border border-[#444CE7]" : "bg-white border"}
        ,${isCOO ? "bg-[#FFFAEC] border border-[#FC8102]" : "bg-white border"}`}
      >
        {/* Avatar */}
        <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white shadow -mt-12">
          <Image
            src={data.photo}
            alt={data.name}
            width={64}
            height={64}
            className="object-cover"
          />
        </div>

        {/* Name & Role */}
        <h3 className="mt-3 font-semibold text-gray-900 text-sm">
          {data.name}
        </h3>
        <p className="text-xs text-gray-600">{data.role}</p>

        {/* Department (pill) */}
        <div
          className={`mt-3 px-3 py-1 rounded-lg text-xs font-medium ${
            isCEO ? "bg-[#6CC24A] text-white" : "bg-[#6CC24A] text-gray-700"
          }${isHR ? "bg-violet-600 text-white" : "bg-[#6CC24A] text-white"}
          ${isTech ? "bg-[#EE46BC] text-white" : "bg-[#6CC24A] text-white"}
          ${isCTO ? "bg-[#444CE7] text-white" : "bg-[#6CC24A] text-gray-700"}
          ${isCOO ? "bg-[#FC8102] text-white" : "bg-[#6CC24A] text-gray-700"}`}
        >
          {data.department}
        </div>

        {/* Location (pill for CEO, text for others) */}
        {isCEO ? (
          <div className="mt-2 px-3 py-1 bg-[#C9F2C7] text-gray-800 text-xs font-medium rounded-lg">
            {data.location}
          </div>
        ) : isHR ? (
          <div className="mt-2 px-3 py-1 bg-[#BDB4FE] text-gray-800 text-xs font-medium rounded-lg">
            {data.location}
          </div>
        ) : isTech ? (
          <div className="mt-2 px-3 py-1 bg-[#A4BCFD] text-gray-800 text-xs font-medium rounded-lg">
            {data.location}
          </div>
        ) : isCTO ? (
          <div className="mt-2 px-3 py-1 bg-[#A4BCFD] text-gray-800 text-xs font-medium rounded-lg">
            {data.location}
          </div>
        ) : isCOO ? (
          <div className="mt-2 px-3 py-1 bg-[#FFD26E] text-gray-800 text-xs font-medium rounded-lg">
            {data.location}
          </div>
        ) : (
          <p className="text-[10px] text-gray-500 mt-2">{data.location}</p>
        )}

        {/* Handles for edges */}
        <Handle type="target" position={Position.Top} />
        <Handle type="source" position={Position.Bottom} />
      </div>

      {/* /// hr// */}
    </>
  );
};

const DeptCard = ({ data }: { data: DeptData }) => (
  <div
    className="w-40 p-2 rounded-xl text-center border shadow-sm"
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
  // CEO
  {
    id: "ceo",
    type: "staffCard",
    position: { x: 600, y: 0 },
    data: {
      name: "Emeka Okafor",
      role: "CEO",
      department: "Procurement",
      location: "Maryland, USA",
      photo: img,
    },
  },

  // Top-level
  {
    id: "hr",
    type: "staffCard",
    position: { x: 200, y: 200 },
    data: {
      name: "Sarah Johnson",
      role: "Hiring Manager",
      department: "HR",
      location: "Maryland, USA",
      photo: img2,
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
      photo: img2,
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
      photo: img2,
    },
  },
  {
    id: "coo",
    type: "staffCard",
    position: { x: 900, y: 200 },
    data: {
      name: "Ben Thompson",
      role: "COO",
      department: "Operations",
      location: "Maryland, USA",
      photo: img2,
    },
  },

  // ---- CTO DEPARTMENTS ----
  ...[
    "Frontend Dev",
    "Backend Dev",
    "Mobile Dev",
    "Projects",
    "Quality Assurance",
  ].map((label, i) => ({
    id: label.toLowerCase().replace(/\s+/g, ""),
    type: "deptCard" as const,
    position: { x: 450 + i * 100, y: 400 },
    data: {
      label,
      borderColor: "#EEF4FF",
      bgColor: "#EEF4FF",
      btnColor: "#6172F3",
    },
  })),

  // ---- COO DEPARTMENTS ----
  ...[
    "Business Ops",
    "Media",
    "Data",
    "Product & Marketing",
    "Research Units",
  ].map((label, i) => ({
    id: label.toLowerCase().replace(/\s+/g, ""),
    type: "deptCard" as const,
    position: { x: 500 + i * 120, y: 600 },
    data: {
      label,
      borderColor: "#FFFAEC",
      bgColor: "#FFFAEC",
      btnColor: "#FF990C",
    },
  })),

  // ---- Business Ops children ----
  ...["Platform Site", "Media Sales", "Biz/Partnership"].map((label, i) => ({
    id: label.toLowerCase().replace(/\W+/g, ""),
    type: "deptCard" as const,
    position: { x: 400 + i * 100, y: 800 },
    data: {
      label,
      borderColor: "#FFFAEC",
      bgColor: "#FFFAEC",
      btnColor: "#FF990C",
    },
  })),

  // ---- Media children ----
  ...["CNTV", "Editorial"].map((label, i) => ({
    id: label.toLowerCase(),
    type: "deptCard" as const,
    position: { x: 700 + i * 100, y: 800 },
    data: {
      label,
      borderColor: "#FFFAEC",
      bgColor: "#FFFAEC",
      btnColor: "#FF990C",
    },
  })),

  // ---- Data children ----
  ...["Data Acquisition", "Confirmation", "Data Analysis"].map((label, i) => ({
    id: label.toLowerCase().replace(/\s+/g, ""),
    type: "deptCard" as const,
    position: { x: 900 + i * 100, y: 800 },
    data: {
      label,
      borderColor: "#FFFAEC",
      bgColor: "#FFFAEC",
      btnColor: "#FF990C",
    },
  })),

  // ---- Product & Marketing children ----
  ...["UX/UI", "Product Managers", "Product Marketing", "Marketing"].map(
    (label, i) => ({
      id: label.toLowerCase().replace(/\s+/g, ""),
      type: "deptCard" as const,
      position: { x: 600 + i * 120, y: 1000 },
      data: {
        label,
        borderColor: "#FFFAEC",
        bgColor: "#FFFAEC",
        btnColor: "#FF990C",
      },
    })
  ),

  // ---- Marketing children ----
  ...[
    "Graphics",
    "Copywriting",
    "Digital Marketing",
    "Social & Content",
    "Offline Marketing",
  ].map((label, i) => ({
    id: label.toLowerCase().replace(/\s+/g, ""),
    type: "deptCard" as const,
    position: { x: 500 + i * 120, y: 1200 },
    data: {
      label,
      borderColor: "#FFFAEC",
      bgColor: "#FFFAEC",
      btnColor: "#FF990C",
    },
  })),

  // ---- Digital Marketing child ----
  {
    id: "seo",
    type: "deptCard" as const,
    position: { x: 750, y: 1400 },
    data: {
      label: "SEO & PPC",
      borderColor: "#FFFAEC",
      bgColor: "#FFFAEC",
      btnColor: "#FF990C",
    },
  },
];

// ---------------- EDGES ----------------
const initialEdges: Edge[] = [
  // CEO connections
  { id: "ceo-hr", source: "ceo", target: "hr", type: "smoothstep" },
  { id: "ceo-tech", source: "ceo", target: "technical", type: "smoothstep" },
  { id: "ceo-cto", source: "ceo", target: "cto", type: "smoothstep" },
  { id: "ceo-coo", source: "ceo", target: "coo", type: "smoothstep" },

  // CTO children
  ...[
    "frontenddev",
    "backenddev",
    "mobiledev",
    "projects",
    "qualityassurance",
  ].map((id) => ({
    id: `cto-${id}`,
    source: "cto",
    target: id,
    type: "smoothstep",
  })),

  // COO children
  ...["businessops", "media", "data", "product&marketing", "researchunits"].map(
    (id) => ({
      id: `coo-${id}`,
      source: "coo",
      target: id,
      type: "smoothstep",
    })
  ),

  // Business Ops children
  ...["platformsite", "mediasales", "bizpartnership"].map((id) => ({
    id: `biz-${id}`,
    source: "businessops",
    target: id,
    type: "smoothstep",
  })),

  // Media children
  ...["cntv", "editorial"].map((id) => ({
    id: `media-${id}`,
    source: "media",
    target: id,
    type: "smoothstep",
  })),

  // Data children
  ...["dataacquisition", "confirmation", "dataanalysis"].map((id) => ({
    id: `data-${id}`,
    source: "data",
    target: id,
    type: "smoothstep",
  })),

  // Product & Marketing children
  ...["ux/ui", "productmanagers", "productmarketing", "marketing"].map(
    (id) => ({
      id: `pm-${id}`,
      source: "product&marketing",
      target: id,
      type: "smoothstep",
    })
  ),

  // Marketing children
  ...[
    "graphics",
    "copywriting",
    "digitalmarketing",
    "social&content",
    "offlinemarketing",
  ].map((id) => ({
    id: `m-${id}`,
    source: "marketing",
    target: id,
    type: "smoothstep",
  })),

  // Digital Marketing child
  {
    id: "dm-seo",
    source: "digitalmarketing",
    target: "seo",
    type: "smootjhstep",
  },
];

// ---------------- MAIN COMPONENT ----------------
export default function OrgChartDemo() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>(initialEdges);
  const [selectedDept, setSelectedDept] = useState<string | null>(null);
  const [staffList, setStaffList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const onConnect = useCallback(
    (params: any) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  // 🔹 Handle click on any department node
  const onNodeClick = async (_: any, node: any) => {
    if (node.type === "deptCard") {
      const departmentName = node.data.label;
      setSelectedDept(departmentName);
      setLoading(true);
      try {
        const res = await Api.get(
          `/staff-register/all/staffs/by-department?name=${encodeURIComponent(
            departmentName
          )}`
        );
        setStaffList(res.data || []);
        setShowModal(true);
      } catch (error) {
        console.error("Error fetching staff for", departmentName, error);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div style={{ width: "100%", height: "200vh", cursor: "pointer" }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        fitView
      >
        <MiniMap />
        <Controls />
        <Background gap={12} color="#f3f3f3" />
      </ReactFlow>

      {/* 🔹 Modal to display staff */}
      {showModal && (
        <StaffDirectoryModal
          department={selectedDept!}
          staffList={staffList}
          loading={loading}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}
