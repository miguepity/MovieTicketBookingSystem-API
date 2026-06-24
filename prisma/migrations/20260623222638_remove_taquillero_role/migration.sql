-- Reassign any users with rol 'taquillero' to 'admin'
UPDATE "usuarios"
SET "id_rol" = (SELECT "id" FROM "roles" WHERE "nombre" = 'admin' LIMIT 1)
WHERE "id_rol" IN (SELECT "id" FROM "roles" WHERE "nombre" = 'taquillero');

DELETE FROM "roles" WHERE "nombre" = 'taquillero';
