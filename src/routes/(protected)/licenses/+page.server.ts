import { fail, type Actions } from '@sveltejs/kit';
import { z } from 'zod';

import { db } from '$lib/server/db';
import { license, product } from '$lib/server/db/schema';

import type { PageServerLoad } from './$types';

const createLicenseSchema = z.object({
	productId: z.string().uuid('Please select a product'),
	key: z.string().min(1, 'Key is required'),
	usageVolume: z.preprocess(
		(v) => (v === '' || v == null ? undefined : v),
		z.coerce.number({ error: 'Must be a number' }).int().min(0, 'Must be 0 or a positive number'),
	),
});

export const load: PageServerLoad = async () => {
	const products = await db.select({ id: product.id, name: product.name }).from(product);
	return { products };
};

export const actions: Actions = {
	createLicense: async ({ request }) => {
		const formData = await request.formData();
		const data = Object.fromEntries(formData) as Record<string, string>;
		const result = createLicenseSchema.safeParse(data);

		if (!result.success) {
			return fail(400, {
				errors: result.error.flatten().fieldErrors,
				data,
			});
		}

		try {
			await db.insert(license).values(result.data);
			return { success: true };
		} catch (error) {
			if (error instanceof Error && 'code' in error && error.code === '23505') {
				const errors: Record<keyof z.infer<typeof createLicenseSchema>, string[] | undefined> = {
					productId: undefined,
					key: ['This key already exists for the selected product'],
					usageVolume: undefined,
				};
				return fail(409, { errors, data });
			}
			console.error('Error creating license:', error);
			return fail(500, { message: 'Failed to create license' });
		}
	},
};
