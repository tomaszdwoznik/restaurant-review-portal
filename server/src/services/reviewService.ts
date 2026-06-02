import { Prisma } from '@prisma/client';
import { prisma } from '../config/prisma';
import type { CreateReviewInput } from '../validators/review';

export interface ReviewSearchRow {
    id: string;
    comment: string | null;
    rating: number;
    restaurantId: string;
    restaurantName: string;
    rank: number;
}

export async function addReview(userId: string, restaurantId: string, input: CreateReviewInput) {
    const restaurant = await prisma.restaurant.findUnique({
        where: { id: restaurantId },
        select: { id: true },
    });
    if (!restaurant) {
        const err: any = new Error('Nie znaleziono restauracji');
        err.status = 404;
        throw err;
    }

    try {
        return await prisma.review.create({
            data: { userId, restaurantId, rating: input.rating, comment: input.comment },
            include: { user: { select: { id: true, displayName: true } } },
        });
    } catch (e) {
        if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
            const err: any = new Error('Już oceniłeś tę restaurację. Usuń opinię, aby dodać nową.');
            err.status = 409;
            throw err;
        }
        throw e;
    }
}

export async function deleteReview(userId: string, restaurantId: string) {
    const result = await prisma.review.deleteMany({ where: { userId, restaurantId } });
    if (result.count === 0) {
        const err: any = new Error('Nie masz opinii do usunięcia dla tej restauracji');
        err.status = 404;
        throw err;
    }
}

export async function searchReviews(q: string) {
    const tsquery = q
        .split(/\s+/)
        .map((word) => word.replace(/[^\p{L}\p{N}]/gu, ''))
        .filter(Boolean)
        .map((word) => `${word}:*`)
        .join(' & ');

    if (!tsquery) return [];

    return prisma.$queryRaw<ReviewSearchRow[]>`
    SELECT r.id, r.comment, r.rating, r."restaurantId",
            rest.name AS "restaurantName",
            ts_rank(r."commentSearch", to_tsquery('simple', ${tsquery})) AS rank
    FROM "Review" r
    JOIN "Restaurant" rest ON rest.id = r."restaurantId"
    WHERE r."commentSearch" @@ to_tsquery('simple', ${tsquery})
    ORDER BY rank DESC
    LIMIT 50;
`;
}