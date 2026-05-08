export const DEMO_PASSWORD = 'password';

export const DEMO_USERS = [
	{ id: 'demo-employee', name: 'Sarah Johnson', email: 'sarah.johnson@company.com', role: 'user' as const },
	{ id: 'demo-admin', name: 'Emily Rodriguez', email: 'emily.rodriguez@company.com', role: 'admin' as const },
];

export const DEMO_EMAILS = DEMO_USERS.map((u) => u.email);
