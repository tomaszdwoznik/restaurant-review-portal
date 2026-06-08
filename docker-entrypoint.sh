#!/bin/sh
set -e

echo "> Migracja bazy..."
npx prisma migrate deploy

echo "> Seeduję bazę..."
npm run seed

echo "> Startuję aplikację na porcie ${PORT}..."
exec npx tsx src/server.ts