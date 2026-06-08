#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"

if ! command -v docker >/dev/null 2>&1; then
    echo "> Nie znaleziono Dockera. Zainstaluj Docker Desktop: https://docker.com/get-started"
    exit 1
fi

if ! docker info >/dev/null 2>&1; then
    echo "> Docker jest zainstalowany, ale nie działa. Uruchom Docker Desktop i spróbuj ponownie."
    exit 1
fi

if docker compose version >/dev/null 2>&1; then
    DC="docker compose"
elif command -v docker-compose >/dev/null 2>&1; then
    DC="docker-compose"
else
    echo "> Brak Docker Compose. Zaktualizuj Dockera do wersji z wbudowanym 'docker compose'."
    exit 1
fi

echo "> Buduję i uruchamiam aplikację..."
$DC up --build