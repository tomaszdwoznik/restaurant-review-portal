import { z } from 'zod';

export const listQuerySchema = z.object({
    name: z.string().optional(),
    sort: z.enum(['name_asc', 'name_desc']).optional(),
    menuType: z.string().optional(),
    lat: z.coerce.number().min(-90).max(90).optional(),
    lng: z.coerce.number().min(-180).max(180).optional(),
    radiusKm: z.coerce.number().positive().max(20000).optional(),
});

export type ListQuery = z.infer<typeof listQuerySchema>;

