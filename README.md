# rodya.ru

Домашняя страница [rodya.ru](https://rodya.ru/) — сетка быстрых ссылок.

## Локально

```bash
docker compose up -d
```

Открыть: http://localhost:8012

## Продакшен

Push в `main` → GitHub Actions (self-hosted runner) зеркалирует статику в docroot nginx.

## Структура

```
index.html                 # страница
scripts/main.js            # пароль + погода НГУ
images/                    # иконки тайлов
assets/icons/              # favicon / PWA
manifest.json              # web app manifest
browserconfig.xml          # плитки Windows
default.conf               # nginx для docker
docker-compose.yml         # локальный nginx
.github/workflows/         # деплой
yandex_*.html              # верификация Яндекса
```
