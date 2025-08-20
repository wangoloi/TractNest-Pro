# TrackNest Backend (DDD)

## Setup

1. Copy `.env.example` to `.env` and set values
2. Install dependencies

```
npm i
```

3. Create schema in MySQL

```
SOURCE src/infrastructure/database/schema.sql;
```

4. Start dev server

```
npm run dev
```

## DDD Structure

- `domain/` entities and repository contracts
- `application/` services and use-cases
- `infrastructure/` MySQL adapters and DB
- `interfaces/` HTTP controllers and routes

## Routes

- `GET /health`
- `GET /api/inventory`
- `POST /api/inventory`
- `PUT /api/inventory/:id`
- `DELETE /api/inventory/:id`
- `GET /api/sales`
- `POST /api/sales`
- `DELETE /api/sales/:id`



