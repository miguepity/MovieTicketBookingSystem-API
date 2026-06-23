CREATE TYPE "ReservaEstado" AS ENUM ('pendiente_pago','pagada','cancelada','reembolsada','expirada');
CREATE TYPE "PagoEstado" AS ENUM ('procesando','exitoso','rechazado','reembolsado');
CREATE TYPE "FuncionEstado" AS ENUM ('programada','en_curso','finalizada','cancelada');
CREATE TYPE "AsientoFuncionEstado" AS ENUM ('disponible','bloqueado','reservado','ocupado');
CREATE TYPE "ReembolsoEstado" AS ENUM ('pendiente','procesado','rechazado');

ALTER TABLE reservas
  ALTER COLUMN estado TYPE "ReservaEstado" USING estado::"ReservaEstado";
ALTER TABLE pagos
  ALTER COLUMN estado TYPE "PagoEstado" USING estado::"PagoEstado";
ALTER TABLE funciones
  ALTER COLUMN estado TYPE "FuncionEstado" USING estado::"FuncionEstado";
ALTER TABLE asientos_funcion
  ALTER COLUMN estado TYPE "AsientoFuncionEstado" USING estado::"AsientoFuncionEstado";
ALTER TABLE reembolsos
  ALTER COLUMN estado TYPE "ReembolsoEstado" USING estado::"ReembolsoEstado";
