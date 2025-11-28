"use client";

import React, { useCallback, useEffect, useState } from "react";
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
import Image from "next/image";
import Link from "next/link";
import Api from "@/utils/api";

import ceoImg from "../../assests/images/ceo.jpg";
import LoadingSpinner from "@/component/Loading/LoadingSpinner";
import StaffDirectoryModal from "@/component/StaffDirectoryModal/StaffDirectoryModal";

// ---------------- TYPES ----------------
interface Staff {
  id: number;
  uuid: string;

  firstName: string;
  lastName: string;
  photoUrl?: string;
  employment?: {
    jobTitle: string[];
  };
}

interface Department {
  id: number;
  name: string;
  nameAbrv?: string;
  description?: string;
}

interface DepartmentalRole {
  id: number;
  title: string;
  department: Department;
}

interface HeadOfDepartment {
  id: number;

  staff: Staff;
  department: Department;
}

interface StaffData {
  name: string;
  role: string;
  department: string;
  photo: string;
  id?: number;
  uuid: string;
}

interface DeptData {
  label: string;
  borderColor: string;
  bgColor: string;
  btnColor: string;
}

type OrgNode = Node<StaffData | DeptData, "staffCard" | "deptCard">;
// type OrgNode = Node<StaffData | DeptData, "staffCard" | "deptCard">;

// ---------------- NODE COMPONENTS ----------------
const StaffCard = ({ data }: { data: StaffData }) => {
  const isCEO = data.role === "CEO";
  const isHOD = data.role === "HOD";

  return (
    <div
      className={`relative w-48 p-4 rounded-2xl shadow-md flex flex-col items-center text-center transition hover:scale-[1.02]
        ${
          isCEO
            ? "bg-[#F9FFE6] border border-lime-300"
            : "bg-white border border-gray-200"
        },${isHOD ? "bg-[#FEF6FB] border border-[#F670C7]" : "bg-white border"}
      `}
    >
      <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white shadow -mt-12">
        <Image
          src={data.photo || ceoImg}
          alt={data.name}
          width={64}
          height={64}
          className="object-cover"
        />
      </div>

      <h3 className="mt-3 font-semibold text-gray-900 text-sm">{data.name}</h3>
      <p className="text-xs text-gray-600">{data.role}</p>

      <div
        className={`mt-3 px-3 py-1 rounded-lg text-xs font-medium ${
          isCEO ? "bg-[#6CC24A] text-white" : "bg-[#EEF4FF] text-[#344054]"
        }${isHOD ? "bg-[#6CC24A] text-red" : "bg-[#EEF4FF] text-white"}`}
      >
        {data.department}
      </div>

      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />

      {data?.uuid && (
        <Link
          href={`/staff/${data?.uuid}`}
          className="absolute inset-0 z-10"
          title={data.name}
        />
      )}
    </div>
  );
};

const DeptCard = ({ data }: { data: DeptData }) => (
  <div
    className="w-40 p-2 rounded-xl text-center border shadow-sm hover:scale-[1.02] transition"
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
const initialNodes: OrgNode[] = [];
// const initialEdges: Edge[]
// ---------------- MAIN COMPONENT ----------------
export default function OrgChart() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);

  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge[]>([]);

  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [selectedDept, setSelectedDept] = useState<string | null>(null);
  const [staffList, setStaffList] = useState<any[]>([]);

  // ===== Fetch Data =====
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [hodRes, deptRes, roleRes] = await Promise.all([
          Api.get("/headofdepartment"),
          Api.get("/departments"),
          Api.get("/departmental-role"),
        ]);

        const hods: HeadOfDepartment[] = hodRes.data;
        const departments: Department[] = deptRes.data;
        const roles: DepartmentalRole[] = roleRes.data;

        const builtNodes: OrgNode[] = [];
        const builtEdges: Edge[] = [];

        // CEO (static)
        builtNodes.push({
          id: "ceo",

          type: "staffCard",
          position: { x: 600, y: 0 },
          data: {
            uuid: "ceo",
            name: "Emeka Okafor",
            role: "CEO",
            department: "Chief Executive Officer",
            photo: ceoImg.src,
          },
        });

        // Layout Y offsets
        const yHod = 250;
        const yDept = 450;
        const yRole = 650;
        const yJob = 850;

        // Loop through Heads of Departments
        for (let i = 0; i < hods.length; i++) {
          const hod = hods[i];
          const xOffset = 300 * i;
          const hodNodeId = `hod-${hod.id}`;
          const hodDeptId = hod.department?.id;

          // ---------- HOD Node ----------
          builtNodes.push({
            id: hodNodeId,
            type: "staffCard",
            position: { x: 300 + xOffset, y: yHod },
            data: {
              id: hod.staff?.id,
              uuid: hod.staff?.uuid,
              name: `${hod.staff?.firstName ?? ""} ${
                hod.staff?.lastName ?? ""
              }`,
              role: "HOD",
              department: hod.department?.name ?? "",
              photo: hod.staff?.photoUrl ?? ceoImg.src,
            },
          });

          builtEdges.push({
            id: `ceo-${hodNodeId}`,
            source: "ceo",
            target: hodNodeId,
            type: "smoothstep",
          });

          // ---------- Department Node ----------
          const hodDepartments = departments.filter((d) => d.id === hodDeptId);
          for (const dept of hodDepartments) {
            const deptNodeId = `dept-${dept.id}`;
            builtNodes.push({
              id: deptNodeId,
              type: "deptCard",
              position: { x: 250 + xOffset, y: yDept },
              data: {
                label: dept.name,
                borderColor: "#EEF4FF",
                bgColor: "#EEF4FF",
                btnColor: "#6172F3",
              },
            });

            builtEdges.push({
              id: `${hodNodeId}-${deptNodeId}`,
              source: hodNodeId,
              target: deptNodeId,
              type: "smoothstep",
            });

            // ---------- Departmental Roles ----------
            const deptRoles = roles.filter((r) => r.department?.id === dept.id);
            for (let k = 0; k < deptRoles.length; k++) {
              const role = deptRoles[k];
              const roleNodeId = `role-${role.id}`;

              builtNodes.push({
                id: roleNodeId,
                type: "deptCard",
                position: { x: 250 + xOffset + k * 150, y: yRole },
                data: {
                  label: role.title,
                  borderColor: "#FFFAEC",
                  bgColor: "#FFFAEC",
                  btnColor: "#FF990C",
                },
              });

              builtEdges.push({
                id: `${deptNodeId}-${roleNodeId}`,
                source: deptNodeId,
                target: roleNodeId,
                type: "smoothstep",
              });

              // ---------- Fetch and Add Job Titles under Role ----------
              try {
                const jobRes = await Api.get(
                  `/departmental-role/${role.id}/job-titles`
                );
                const jobTitles: string[] = jobRes.data;

                for (let j = 0; j < jobTitles.length; j++) {
                  const jobTitle = jobTitles[j];
                  const jobNodeId = `role-${role.id}-job-${j}`;

                  builtNodes.push({
                    id: jobNodeId,
                    type: "deptCard",
                    position: { x: 250 + xOffset + j * 100, y: yJob },
                    data: {
                      label: jobTitle,
                      borderColor: "#FFF3E0",
                      bgColor: "#FFF3E0",
                      btnColor: "#FFB347",
                    },
                  });

                  builtEdges.push({
                    id: `${roleNodeId}-${jobNodeId}`,
                    source: roleNodeId,
                    target: jobNodeId,
                    type: "smoothstep",
                  });
                }
              } catch (jobErr) {
                console.warn(
                  `No job titles found for role ${role.title}:`,
                  jobErr
                );
              }
            }
          }
        }

        setNodes(builtNodes);
        setEdges(builtEdges);
      } catch (error) {
        console.error("Error building org chart:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // ====== Click Handling ======
  const onNodeClick = async (_: any, node: any) => {
    if (node.type === "deptCard") {
      const departmentName = node.data.label;
      setSelectedDept(departmentName);
      setShowModal(true);

      try {
        const res = await Api.get(
          `/staff-register/all/staffs/by-department?name=${encodeURIComponent(
            departmentName
          )}`
        );
        setStaffList(res.data || []);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const onConnect = useCallback(
    (params: any) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  if (loading)
    return (
      <div className="w-full h-[80vh] flex items-center justify-center text-gray-600">
        <LoadingSpinner />
      </div>
    );

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

      {showModal && (
        <StaffDirectoryModal
          department={selectedDept!}
          staffList={staffList}
          loading={false}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}
