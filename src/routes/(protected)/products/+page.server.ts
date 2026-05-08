import { fail, type Actions } from '@sveltejs/kit';
import { z } from 'zod';

import { db } from '$lib/server/db';
import { product } from '$lib/server/db/schema';

const createProductSchema = z.object({
	name: z.string().min(1, 'Name is required'),
	description: z.preprocess((v) => (v === '' ? null : v), z.string().nullable()),
	maxLicensesPerUser: z.preprocess(
		(v) => (v === '' || v == null ? undefined : v),
		z.coerce.number({ error: 'Must be a number' }).int().min(0, 'Must be 0 or a positive number'),
	),
	requiresApproval: z.preprocess((val) => val === 'on', z.boolean()),
});

export const actions: Actions = {
	createProduct: async ({ request }) => {
		const formData = await request.formData();
		const data = Object.fromEntries(formData) as Record<string, string>;
		const result = createProductSchema.safeParse(data);

		if (!result.success) {
			return fail(400, {
				errors: result.error.flatten().fieldErrors,
				data,
			});
		}

		try {
			await db.insert(product).values(result.data);
			return { success: true };
		} catch (error) {
			console.error('Error creating product:', error);
			return fail(500, { message: 'Failed to create product' });
		}
	},
};
