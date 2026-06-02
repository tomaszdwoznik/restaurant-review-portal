import 'dotenv/config';
import argon2 from 'argon2';
import { prisma } from '../src/config/prisma';

async function main() {
    // --- Czyszczenie (seed idempotentny — można odpalać wielokrotnie) ---
    // Kolejność ważna ze względu na klucze obce.
    await prisma.review.deleteMany();
    await prisma.restaurant.deleteMany();
    // MenuType i User aktualizujemy przez upsert niżej, więc ich nie kasujemy.

    // --- Rodzaje menu po polsku (wym. 4) ---
    const menuNames = [
        'Włoska', 'Wegańska', 'Japońska', 'Amerykańska', 'Polska', 'Indyjska',
        'Meksykańska', 'Tajska', 'Francuska', 'Grecka', 'Turecka', 'Kawiarnia',
    ];
    const menu: Record<string, { id: string }> = {};
    for (const name of menuNames) {
        menu[name] = await prisma.menuType.upsert({
            where: { name },
            update: {},
            create: { name },
        });
    }

    // --- Użytkownicy (wym. 6) — hasła hashowane argon2 (pozaf. 4) ---
    const passwordHash = await argon2.hash('password123');
    const userDefs = [
        { key: 'alice', email: 'alice@example.com', displayName: 'Alice' },
        { key: 'bob', email: 'bob@example.com', displayName: 'Bob' },
        { key: 'celina', email: 'celina@example.com', displayName: 'Celina' },
        { key: 'darek', email: 'darek@example.com', displayName: 'Darek' },
        { key: 'ewa', email: 'ewa@example.com', displayName: 'Ewa' },
        { key: 'filip', email: 'filip@example.com', displayName: 'Filip' },
    ];
    const u: Record<string, { id: string }> = {};
    for (const d of userDefs) {
        u[d.key] = await prisma.user.upsert({
            where: { email: d.email },
            update: {},
            create: { email: d.email, displayName: d.displayName, passwordHash },
        });
    }

    // --- Zdjęcia tematyczne wg kuchni (stałe URL-e — seed ma być powtarzalny) ---
    const photo: Record<string, string> = {
        italian: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=80',
        vegan: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80',
        japanese: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=800&q=80',
        american: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80',
        polish: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=800&q=80',
        mexican: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&q=80',
        thai: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&q=80',
        french: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&q=80',
        greek: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&q=80',
        turkish: 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=800&q=80',
        indian: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&q=80',
        cafe: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&q=80',
    };

    // --- Restauracje (wym. 7) ---
    // 12 w Krakowie (~50.06, 19.94) + Warszawa i Wrocław CELOWO daleko,
    // żeby filtr "w pobliżu" (wym. 3) miał co odcinać.
    const restaurantDefs = [
        { slug: 'trattoria', name: 'Trattoria Soprano', address: 'Rynek Główny 12, Kraków', lat: 50.0617, lng: 19.9373, owner: 'alice', menus: ['Włoska'], photo: 'italian' },
        { slug: 'greenbowl', name: 'Green Bowl', address: 'ul. Karmelicka 5, Kraków', lat: 50.0655, lng: 19.9300, owner: 'alice', menus: ['Wegańska', 'Indyjska'], photo: 'vegan' },
        { slug: 'sakura', name: 'Sakura Sushi', address: 'ul. Długa 22, Kraków', lat: 50.0700, lng: 19.9400, owner: 'bob', menus: ['Japońska'], photo: 'japanese' },
        { slug: 'burger', name: 'Burger Republic', address: 'ul. Mogilska 40, Kraków', lat: 50.0640, lng: 19.9700, owner: 'bob', menus: ['Amerykańska'], photo: 'american' },
        { slug: 'tacos', name: 'Casa de Tacos', address: 'ul. Grodzka 18, Kraków', lat: 50.0580, lng: 19.9450, owner: 'celina', menus: ['Meksykańska'], photo: 'mexican' },
        { slug: 'bangkok', name: 'Bangkok Street', address: 'ul. Krupnicza 8, Kraków', lat: 50.0620, lng: 19.9280, owner: 'darek', menus: ['Tajska'], photo: 'thai' },
        { slug: 'cafe', name: 'Le Petit Café', address: 'ul. Floriańska 30, Kraków', lat: 50.0660, lng: 19.9420, owner: 'ewa', menus: ['Francuska', 'Kawiarnia'], photo: 'french' },
        { slug: 'pierogarnia', name: 'Pierogarnia pod Wawelem', address: 'ul. Kanonicza 10, Kraków', lat: 50.0540, lng: 19.9350, owner: 'alice', menus: ['Polska'], photo: 'polish' },
        { slug: 'kebab', name: 'Kebab King', address: 'ul. Starowiślna 50, Kraków', lat: 50.0680, lng: 19.9480, owner: 'filip', menus: ['Turecka'], photo: 'turkish' },
        { slug: 'athena', name: 'Athena Taverna', address: 'ul. Stradomska 15, Kraków', lat: 50.0600, lng: 19.9550, owner: 'celina', menus: ['Grecka'], photo: 'greek' },
        { slug: 'forno', name: 'Pizza Forno', address: 'ul. Sławkowska 3, Kraków', lat: 50.0710, lng: 19.9370, owner: 'darek', menus: ['Włoska'], photo: 'italian' },
        { slug: 'spice', name: 'Spice of India', address: 'ul. Zwierzyniecka 25, Kraków', lat: 50.0590, lng: 19.9200, owner: 'ewa', menus: ['Indyjska'], photo: 'indian' },
        { slug: 'starymlyn', name: 'Stary Młyn', address: 'ul. Nowy Świat 30, Warszawa', lat: 52.2310, lng: 21.0190, owner: 'alice', menus: ['Polska'], photo: 'polish' },
        { slug: 'gorska', name: 'Górska Chata', address: 'ul. Świdnicka 40, Wrocław', lat: 51.1079, lng: 17.0385, owner: 'filip', menus: ['Polska'], photo: 'polish' },
    ];
    const r: Record<string, { id: string }> = {};
    for (const d of restaurantDefs) {
        r[d.slug] = await prisma.restaurant.create({
            data: {
                name: d.name,
                address: d.address,
                latitude: d.lat,
                longitude: d.lng,
                photoUrl: photo[d.photo],
                ownerId: u[d.owner].id,
                menuTypes: { connect: d.menus.map((m) => ({ id: menu[m].id })) },
            },
        });
    }

    // --- Opinie (wym. 8) — max jedna na parę (user, restauracja) ---
    // Różne słowa w komentarzach => jest co testować w wyszukiwaniu FTS (wym. 11).
    // commentSearch (kolumna wypełniana triggerem) uzupełni się sam — nie podajemy go.
    // Kilka opinii bez komentarza pokazuje, że komentarz jest opcjonalny.
    const reviewDefs: { user: string; restaurant: string; rating: number; comment?: string }[] = [
        // Trattoria Soprano (włoska)
        { user: 'bob', restaurant: 'trattoria', rating: 5, comment: 'Najlepsza pizza neapolitańska w mieście, ciasto idealne. Gorąco polecam!' },
        { user: 'alice', restaurant: 'trattoria', rating: 4, comment: 'Świetne spaghetti carbonara, choć wieczorem bywa głośno.' },
        { user: 'celina', restaurant: 'trattoria', rating: 5, comment: 'Domowe tiramisu rozpływa się w ustach, wrócę tu na pewno.' },
        { user: 'darek', restaurant: 'trattoria', rating: 4 },

        // Green Bowl (wegańska / indyjska)
        { user: 'bob', restaurant: 'greenbowl', rating: 5, comment: 'Pyszne wegańskie curry z ciecierzycą i świeże sałatki.' },
        { user: 'alice', restaurant: 'greenbowl', rating: 4, comment: 'Smaczne bowl z tofu i komosą, obsługa miła i szybka.' },
        { user: 'ewa', restaurant: 'greenbowl', rating: 5, comment: 'Najlepsze wegańskie miejsce w Krakowie, dużo opcji bezglutenowych.' },

        // Sakura Sushi (japońska)
        { user: 'alice', restaurant: 'sakura', rating: 4, comment: 'Najlepszy ramen w okolicy, na sushi trzeba chwilę poczekać.' },
        { user: 'bob', restaurant: 'sakura', rating: 5, comment: 'Świeże sushi i pyszne gyoza, klimatyczne wnętrze.' },
        { user: 'filip', restaurant: 'sakura', rating: 4, comment: 'Dobre maki i ciepła herbata, ceny rozsądne.' },
        { user: 'celina', restaurant: 'sakura', rating: 3 },

        // Burger Republic (amerykańska)
        { user: 'alice', restaurant: 'burger', rating: 3, comment: 'Burger smaczny, ale frytki przyszły zimne, a obsługa była wolna.' },
        { user: 'bob', restaurant: 'burger', rating: 4, comment: 'Soczyste burgery wołowe i duże porcje, na pewno wrócę.' },
        { user: 'celina', restaurant: 'burger', rating: 2, comment: 'Długo czekałam, a mięso było wysuszone.' },

        // Casa de Tacos (meksykańska)
        { user: 'celina', restaurant: 'tacos', rating: 5, comment: 'Autentyczne tacos al pastor, ostre i aromatyczne.' },
        { user: 'darek', restaurant: 'tacos', rating: 4, comment: 'Dobre burrito i świeże guacamole, miła obsługa.' },
        { user: 'alice', restaurant: 'tacos', rating: 3, comment: 'Smaczne, ale dość drogo jak na wielkość porcji.' },

        // Bangkok Street (tajska)
        { user: 'darek', restaurant: 'bangkok', rating: 5, comment: 'Najlepszy pad thai w mieście, idealnie doprawiony.' },
        { user: 'ewa', restaurant: 'bangkok', rating: 4, comment: 'Aromatyczne zielone curry, ostrość do wyboru.' },
        { user: 'filip', restaurant: 'bangkok', rating: 3, comment: 'Smaczne, ale głośno i ciasno w środku.' },

        // Le Petit Café (francuska / kawiarnia)
        { user: 'ewa', restaurant: 'cafe', rating: 5, comment: 'Najlepsze croissanty i kawa w okolicy, urocze wnętrze.' },
        { user: 'alice', restaurant: 'cafe', rating: 4, comment: 'Pyszne ciasta i tarta cytrynowa, idealne na deser.' },
        { user: 'celina', restaurant: 'cafe', rating: 5, comment: 'Klimatyczna kawiarnia, świetne macarons.' },

        // Pierogarnia pod Wawelem (polska)
        { user: 'alice', restaurant: 'pierogarnia', rating: 5, comment: 'Pierogi ruskie i z kapustą wyśmienite, jak domowe.' },
        { user: 'bob', restaurant: 'pierogarnia', rating: 4, comment: 'Duży wybór pierogów i smaczny barszcz czerwony.' },
        { user: 'darek', restaurant: 'pierogarnia', rating: 5, comment: 'Najlepsze pierogi w Krakowie, ceny przystępne.' },

        // Kebab King (turecka)
        { user: 'filip', restaurant: 'kebab', rating: 4, comment: 'Solidny kebab z dużą ilością mięsa i świeżych warzyw.' },
        { user: 'bob', restaurant: 'kebab', rating: 3, comment: 'W porządku, ale sos czosnkowy mógłby być lepszy.' },
        { user: 'darek', restaurant: 'kebab', rating: 4, comment: 'Szybko, tanio i smacznie, dobre na szybki obiad.' },

        // Athena Taverna (grecka)
        { user: 'celina', restaurant: 'athena', rating: 5, comment: 'Pyszny gyros i sałatka grecka z prawdziwą fetą.' },
        { user: 'ewa', restaurant: 'athena', rating: 4, comment: 'Dobre souvlaki i tzatziki, miła obsługa.' },
        { user: 'filip', restaurant: 'athena', rating: 5, comment: 'Klimat jak w Grecji, polecam moussakę.' },

        // Pizza Forno (włoska)
        { user: 'darek', restaurant: 'forno', rating: 4, comment: 'Cienka pizza z pieca opalanego drewnem, naprawdę smaczna.' },
        { user: 'alice', restaurant: 'forno', rating: 5, comment: 'Świetna pizza margherita ze świeżą bazylią.' },
        { user: 'bob', restaurant: 'forno', rating: 4, comment: 'Dobre calzone i tiramisu na deser.' },

        // Spice of India (indyjska)
        { user: 'ewa', restaurant: 'spice', rating: 5, comment: 'Aromatyczne curry tikka masala i świeży chlebek naan.' },
        { user: 'filip', restaurant: 'spice', rating: 4, comment: 'Ostre dania i sporo opcji wegetariańskich.' },
        { user: 'celina', restaurant: 'spice', rating: 4, comment: 'Pyszny biryani, choć trzeba chwilę poczekać.' },

        // Stary Młyn (polska, Warszawa)
        { user: 'bob', restaurant: 'starymlyn', rating: 4, comment: 'Tradycyjne polskie pierogi i żurek, naprawdę smaczne.' },
        { user: 'alice', restaurant: 'starymlyn', rating: 5, comment: 'Wyśmienity rosół i schabowy jak u babci.' },
        { user: 'ewa', restaurant: 'starymlyn', rating: 4, comment: 'Klimatyczne miejsce, pyszny bigos i domowy kompot.' },

        // Górska Chata (polska, Wrocław)
        { user: 'filip', restaurant: 'gorska', rating: 5, comment: 'Regionalne dania kuchni polskiej, świetna kwaśnica.' },
        { user: 'bob', restaurant: 'gorska', rating: 4, comment: 'Pyszne placki ziemniaczane i oscypek z żurawiną.' },
        { user: 'ewa', restaurant: 'gorska', rating: 5, comment: 'Klimatyczna góralska chata, smaczny żurek w chlebie.' },
    ];

    await prisma.review.createMany({
        data: reviewDefs.map((d) => ({
            userId: u[d.user].id,
            restaurantId: r[d.restaurant].id,
            rating: d.rating,
            comment: d.comment,
        })),
    });

    console.log(
        `Seed zakończony ${menuNames.length} kategorii, ${userDefs.length} userów, ` +
        `${restaurantDefs.length} restauracji, ${reviewDefs.length} opinii)`,
    );
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });