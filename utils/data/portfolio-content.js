export const featuredProjectIds = [1, 5, 4];
export const projectEditorial = {
  1: { category: 'Enterprise systems', problem: 'IT assets need a clear history, from allocation to repair.', solution: 'A role-based inventory platform with automated tagging, detailed logs, and LDAP integration with Next HRM.', outcome: 'A connected view of stock, inventory, allocations, and the hardware lifecycle.', nodes: ['ASSETS', 'LDAP', 'AUDIT'], mark: '01' },
  5: { category: 'Collaboration platforms', problem: 'Documents, project work, and organizational access need one shared workspace.', solution: 'Document and project management, a Kanban board, and an admin panel for organizations, roles, and permissions.', outcome: 'A workspace for managing project activity and controlling organizational access.', nodes: ['DOCUMENTS', 'TASKS', 'ROLES'], mark: '02' },
  4: { category: 'Business applications', problem: 'A real estate team needs to connect properties, relationships, and daily tasks.', solution: 'A CRM spanning properties, projects, leads, contacts, staff, and task management.', outcome: 'A unified application for managing client relationships and property workflows.', nodes: ['CONTACTS', 'PROPERTY', 'WORKFLOW'], mark: '03' },
};
export const technologyGroups = [
  { id: 'frontend', title: 'Interfaces that make sense.', summary: 'Responsive applications, component systems, and consistent interaction patterns.', technologies: ['Angular', 'React', 'Next.js', 'TypeScript', 'Ionic', 'Tailwind CSS'] },
  { id: 'backend', title: 'Systems that connect.', summary: 'Application services, structured data, and integrations behind the interface.', technologies: ['Node.js', 'Express', 'NestJS', 'MongoDB', 'MySQL', 'PostgreSQL', 'Laravel'] },
  { id: 'delivery', title: 'From build to delivery.', summary: 'Version control, infrastructure, and the tools that support maintainable software.', technologies: ['Git', 'AWS', 'Docker', 'Nginx', 'Firebase', 'Ubuntu'] },
];
