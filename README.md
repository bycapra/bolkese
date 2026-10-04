# BolKese

Altın, döviz ve nakit takibi. Arayüz Vite + React, API Express + SQLite, canlı fiyatlar [altinapi](https://altinapi.com/docs/).

## Çalıştırma

İki sunucu gerekir. Ayrı terminallerde:

```bash
cd backend
# backend/.env içinde JWT_SECRET tanımlı olmalı (.env.example kopyalanabilir)
npm install
npm run dev
```

```bash
cd frontend
# frontend/.env içinde ALTINAPI_KEY=hapi_...
npm install
npm run dev
```

- API: `http://localhost:4000`
- Arayüz: `http://localhost:5173` (Vite, `/api` isteklerini backend’e, `/api/altin` isteklerini altinapi’ye iletir)

## Ortam değişkenleri

`backend/.env.example`

```
PORT=4000
JWT_SECRET=change-me-to-a-long-random-string
```

`frontend/.env.example`

```
ALTINAPI_KEY=hapi_YOUR_KEY
```

SQLite dosyası `backend/data/bolkese.sqlite` içinde oluşur; git’e eklenmez.
