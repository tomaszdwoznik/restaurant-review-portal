import { prisma } from '../config/prisma';
import type { CreateRestaurantInput } from '../validators/restaurant';

export async function listRestaurants() {
    const restaurants = await prisma.restaurant.findMany({
        orderBy: { name: 'asc' },
        include: {
            menuTypes: { select: { id: true, name: true } },
            reviews: { select: { rating: true } },
        },
    });

    // Zamiast destrukturyzacji w parametrze, używamy po prostu 'restaurant'
    return restaurants.map((restaurant) => {
        // Wyciągamy 'reviews' i resztę danych już wewnątrz ciała funkcji
        const { reviews, ...r } = restaurant;

        return {
            ...r,
            avgRating: reviews.length
                // Dodajemy jawne typowanie dla 'sum' oraz 'rev'
                ? reviews.reduce((sum: number, rev: { rating: number }) => sum + rev.rating, 0) / reviews.length
                : null,
            reviewCount: reviews.length,
        };
    });
}

export async function getRestaurant(id: string) {
    const restaurant = await prisma.restaurant.findUnique({
        where: { id },
        include: {
            menuTypes: { select: { id: true, name: true } },
            owner: { select: { id: true, displayName: true } },
            reviews: {
                orderBy: { createdAt: 'desc' },
                include: { user: { select: { id: true, displayName: true } } },
            },
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

    return { ...restaurant, avgRating: agg._avg.rating, reviewCount: agg._count._all };
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