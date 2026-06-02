import { prisma } from '../config/prisma';
import type { Prisma } from '@prisma/client';
import type { CreateRestaurantInput } from '../validators/restaurant';
import type { ListQuery } from '../validators/restaurantQuery';

export async function listRestaurants(q: ListQuery, userId?: string) {
    const where: Prisma.RestaurantWhereInput = {};
    if (q.name) where.name = { contains: q.name, mode: 'insensitive' };
    if (q.menuType) where.menuTypes = { some: { name: q.menuType } };

    const restaurants = await prisma.restaurant.findMany({
        where,
        orderBy: { name: q.sort === 'name_desc' ? 'desc' : 'asc' },
        include: {
            menuTypes: { select: { id: true, name: true } },
            reviews: { select: { rating: true } },
            favoritedBy: { where: { id: userId ?? '__none__' }, select: { id: true } },
        },
    });

    let result = restaurants.map(({ reviews, favoritedBy, ...r }) => ({
        ...r,
        avgRating: reviews.length
            ? reviews.reduce((sum, rev) => sum + rev.rating, 0) / reviews.length
            : null,
        reviewCount: reviews.length,
        isFavorite: favoritedBy.length > 0,
        distanceKm: null as number | null,
    }));

    if (q.lat !== undefined && q.lng !== undefined) {
        result = result
            .map((r) => ({ ...r, distanceKm: haversineKm(q.lat!, q.lng!, r.latitude, r.longitude) }))
            .filter((r) => (q.radiusKm ? r.distanceKm! <= q.radiusKm : true))
            .sort((a, b) => a.distanceKm! - b.distanceKm!);
    }

    return result;
}

export async function listFavorites(userId: string) {
    const restaurants = await prisma.restaurant.findMany({
        where: { favoritedBy: { some: { id: userId } } },
        orderBy: { name: 'asc' },
        include: {
            menuTypes: { select: { id: true, name: true } },
            reviews: { select: { rating: true } },
        },
    });

    return restaurants.map(({ reviews, ...r }) => ({
        ...r,
        avgRating: reviews.length
            ? reviews.reduce((sum, rev) => sum + rev.rating, 0) / reviews.length
            : null,
        reviewCount: reviews.length,
        isFavorite: true,
    }));
}

export async function getRestaurant(id: string, userId?: string) {
    const restaurant = await prisma.restaurant.findUnique({
        where: { id },
        include: {
            menuTypes: { select: { id: true, name: true } },
            owner: { select: { id: true, displayName: true } },
            reviews: {
                orderBy: { createdAt: 'desc' },
                include: { user: { select: { id: true, displayName: true } } },
            },
            favoritedBy: { where: { id: userId ?? '__none__' }, select: { id: true } },
        },
    });
    if (!restaurant) {
        const err: any = new Error('Nie znaleziono restauracji');
        err.status = 404;
        throw err;
    }
    const agg = await prisma.review.aggregate({
        where: { restaurantId: id },
        _avg: { rating: true },
        _count: { _all: true },
    });
    const { favoritedBy, ...rest } = restaurant;
    return { ...rest, avgRating: agg._avg.rating, reviewCount: agg._count._all, isFavorite: favoritedBy.length > 0 };
}

export async function createRestaurant(ownerId: string, input: CreateRestaurantInput) {
    return prisma.restaurant.create({
        data: {
            name: input.name,
            address: input.address,
            latitude: input.latitude,
            longitude: input.longitude,
            photoUrl: input.photoUrl,
            ownerId,
            menuTypes: { connect: input.menuTypeIds.map((id) => ({ id })) },
        },
        include: { menuTypes: { select: { id: true, name: true } } },
    });
}

export async function deleteRestaurant(id: string, userId: string) {
    const restaurant = await prisma.restaurant.findUnique({
        where: { id },
        select: { ownerId: true },
    });
    if (!restaurant) {
        const err: any = new Error('Nie znaleziono restauracji');
        err.status = 404;
        throw err;
    }
    if (restaurant.ownerId !== userId) {
        const err: any = new Error('Możesz usuwać tylko własne restauracje');
        err.status = 403;
        throw err;
    }
    await prisma.restaurant.delete({ where: { id } }); // opinie zniknaja kaskadowo
}
function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371;
    const toRad = (d: number) => (d * Math.PI) / 180;
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(a));
}

export async function setFavorite(userId: string, restaurantId: string, favorite: boolean) {
    const exists = await prisma.restaurant.findUnique({ where: { id: restaurantId }, select: { id: true } });
    if (!exists) {
        const err: any = new Error('Nie znaleziono restauracji');
        err.status = 404;
        throw err;
    }
    await prisma.user.update({
        where: { id: userId },
        data: {
            favorites: favorite ? { connect: { id: restaurantId } } : { disconnect: { id: restaurantId } },
        },
    });
}