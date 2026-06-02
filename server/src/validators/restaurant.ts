import { z } from 'zod';

export const createRestaurantSchema = z.object({
    name: z.string().min(1),
    address: z.string().min(1),
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
    photoUrl: z
        .string()
        .refine((v) => v.startsWith('/uploads/') || /^https?:\/\//.test(v), {
            message: 'Nieprawidłowy adres zdjęcia',
        })
        .optional(),
    menuTypeIds: z.array(z.string()).min(1, 'Wybierz co najmniej jeden rodzaj menu'),
});

export type CreateRestaurantInput = z.infer<typeof createRestaurantSchema>;