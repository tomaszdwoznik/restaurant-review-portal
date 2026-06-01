import 'dotenv/config';
import argon2 from 'argon2';

import { prisma } from '../src/config/prisma';

async function main() {
    await prisma.review.deleteMany();
    await prisma.restaurant.deleteMany();

    const menuNames = ['Italian', 'Vegan', 'Japanese', 'American', 'Polish', 'Indian'];
    const menu: Record<string, { id: string }> = {};
    for (const name of menuNames) {
        menu[name] = await prisma.menuType.upsert({
            where: { name },
            update: {},
            create: { name },
        });
    }

    const passwordHash = await argon2.hash('password123');
    const alice = await prisma.user.upsert({
        where: { email: 'alice@example.com' },
        update: {},
        create: { email: 'alice@example.com', displayName: 'Alice', passwordHash },
    });
    const bob = await prisma.user.upsert({
        where: { email: 'bob@example.com' },
        update: {},
        create: { email: 'bob@example.com', displayName: 'Bob', passwordHash },
    });

    const trattoria = await prisma.restaurant.create({
        data: {
            name: 'Trattoria Soprano',
            address: 'Rynek Główny 12, Kraków',
            latitude: 50.0617,
            longitude: 19.9373,
            photoUrl: 'https://picsum.photos/seed/trattoria/600/400',
            ownerId: alice.id,
            menuTypes: { connect: [{ id: menu['Italian'].id }] },
        },
    });
    const greenBowl = await prisma.restaurant.create({
        data: {
            name: 'Green Bowl',
            address: 'ul. Karmelicka 5, Kraków',
            latitude: 50.0655,
            longitude: 19.93,
            photoUrl: 'https://picsum.photos/seed/greenbowl/600/400',
            ownerId: alice.id,
            menuTypes: { connect: [{ id: menu['Vegan'].id }, { id: menu['Indian'].id }] },
        },
    });
    const sakura = await prisma.restaurant.create({
        data: {
            name: 'Sakura Sushi',
            address: 'ul. Długa 22, Kraków',
            latitude: 50.07,
            longitude: 19.94,
            photoUrl: 'https://picsum.photos/seed/sakura/600/400',
            ownerId: bob.id,
            menuTypes: { connect: [{ id: menu['Japanese'].id }] },
        },
    });
    const burger = await prisma.restaurant.create({
        data: {
            name: 'Burger Republic',
            address: 'ul. Mogilska 40, Kraków',
            latitude: 50.064,
            longitude: 19.97,
            photoUrl: 'https://picsum.photos/seed/burger/600/400',
            ownerId: bob.id,
            menuTypes: { connect: [{ id: menu['American'].id }] },
        },
    });
    const staryMlyn = await prisma.restaurant.create({
        data: {
            name: 'Stary Młyn',
            address: 'ul. Nowy Świat 30, Warszawa',
            latitude: 52.231,
            longitude: 21.019,
            photoUrl: 'https://picsum.photos/seed/mlyn/600/400',
            ownerId: alice.id,
            menuTypes: { connect: [{ id: menu['Polish'].id }] },
        },
    });

    await prisma.review.createMany({
        data: [
            { userId: bob.id, restaurantId: trattoria.id, rating: 5, comment: 'Świetna pizza i miła obsługa, polecam!' },
            { userId: alice.id, restaurantId: sakura.id, rating: 4, comment: 'Najlepszy ramen w mieście, choć trzeba poczekać.' },
            { userId: bob.id, restaurantId: greenBowl.id, rating: 5, comment: 'Pyszne wegańskie curry, wrócę na pewno.' },
            { userId: alice.id, restaurantId: burger.id, rating: 3, comment: 'Burger ok, ale obsługa była wolna.' },
            { userId: bob.id, restaurantId: staryMlyn.id, rating: 4, comment: 'Tradycyjne polskie pierogi, naprawdę smaczne.' },
            { userId: alice.id, restaurantId: trattoria.id, rating: 4 },
        ],
    });

    console.log('Seed zakończony');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });