# MovieTicketBookingSystem-API

## Initial Setup

1. Setear el archivo `.env` con la URL de conexión a la base de datos PostgreSQL. Por ejemplo:

```
DATABASE_URL="postgresql://postgres@localhost:5432/moviesys"
```

2. Aplicar migraciones para crear las tablas en la base de datos:

```npx prisma migrate deploy
```

3. Generar el cliente de Prisma:

```npx prisma generate
```