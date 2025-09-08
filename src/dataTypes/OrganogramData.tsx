export const orgData = {
  name: "John Doe",
  attributes: {
    role: "Chief Executive Officer",
    department: "Management",
    location: "Head Office",
  },
  children: [
    {
      name: "Jane Smith",
      attributes: {
        role: "HR Hiring Manager",
        department: "HR",
        location: "Lagos",
      },
    },
    {
      name: "Michael Lee",
      attributes: {
        role: "Technical Procurement",
        department: "Procurement",
        location: "Abuja",
      },
    },
    {
      name: "David Brown",
      attributes: { role: "CTO", department: "Tech", location: "Lagos" },
      children: [
        { name: "Frontend Dev", attributes: { department: "Engineering" } },
        { name: "Backend Dev", attributes: { department: "Engineering" } },
        { name: "Mobile Dev", attributes: { department: "Engineering" } },
        { name: "Project Manager", attributes: { department: "Tech Ops" } },
        { name: "QA", attributes: { department: "Engineering" } },
      ],
    },
    {
      name: "Robert Taylor",
      attributes: { role: "COO", department: "Operations", location: "HQ" },
      children: [
        { name: "Business Ops", attributes: { department: "Operations" } },
        { name: "Media & Data", attributes: { department: "Ops" } },
        { name: "Product & Marketing", attributes: { department: "Ops" } },
        { name: "Research Unit", attributes: { department: "Ops" } },
      ],
    },
  ],
};
