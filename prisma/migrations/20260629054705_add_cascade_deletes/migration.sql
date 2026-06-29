-- DropForeignKey
ALTER TABLE "asientos" DROP CONSTRAINT "asientos_id_sala_fkey";

-- DropForeignKey
ALTER TABLE "asientos_funcion" DROP CONSTRAINT "asientos_funcion_id_asiento_fkey";

-- DropForeignKey
ALTER TABLE "asientos_funcion" DROP CONSTRAINT "asientos_funcion_id_funcion_fkey";

-- DropForeignKey
ALTER TABLE "audit_log" DROP CONSTRAINT "audit_log_id_auditor_fkey";

-- DropForeignKey
ALTER TABLE "audit_log" DROP CONSTRAINT "audit_log_id_usuario_fkey";

-- DropForeignKey
ALTER TABLE "cines" DROP CONSTRAINT "cines_id_ciudad_fkey";

-- DropForeignKey
ALTER TABLE "funciones" DROP CONSTRAINT "funciones_id_pelicula_fkey";

-- DropForeignKey
ALTER TABLE "funciones" DROP CONSTRAINT "funciones_id_sala_fkey";

-- DropForeignKey
ALTER TABLE "pagos" DROP CONSTRAINT "pagos_id_reserva_fkey";

-- DropForeignKey
ALTER TABLE "password_reset_token" DROP CONSTRAINT "password_reset_token_id_usuario_fkey";

-- DropForeignKey
ALTER TABLE "peliculas" DROP CONSTRAINT "peliculas_id_usuario_fkey";

-- DropForeignKey
ALTER TABLE "reembolsos" DROP CONSTRAINT "reembolsos_id_pago_fkey";

-- DropForeignKey
ALTER TABLE "reserva_asientos" DROP CONSTRAINT "reserva_asientos_id_asiento_funcion_fkey";

-- DropForeignKey
ALTER TABLE "reserva_asientos" DROP CONSTRAINT "reserva_asientos_id_reserva_fkey";

-- DropForeignKey
ALTER TABLE "reservas" DROP CONSTRAINT "reservas_id_funcion_fkey";

-- DropForeignKey
ALTER TABLE "reservas" DROP CONSTRAINT "reservas_id_usuario_fkey";

-- DropForeignKey
ALTER TABLE "salas" DROP CONSTRAINT "salas_id_cine_fkey";

-- AddForeignKey
ALTER TABLE "cines" ADD CONSTRAINT "cines_id_ciudad_fkey" FOREIGN KEY ("id_ciudad") REFERENCES "ciudades"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "salas" ADD CONSTRAINT "salas_id_cine_fkey" FOREIGN KEY ("id_cine") REFERENCES "cines"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asientos" ADD CONSTRAINT "asientos_id_sala_fkey" FOREIGN KEY ("id_sala") REFERENCES "salas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asientos_funcion" ADD CONSTRAINT "asientos_funcion_id_asiento_fkey" FOREIGN KEY ("id_asiento") REFERENCES "asientos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asientos_funcion" ADD CONSTRAINT "asientos_funcion_id_funcion_fkey" FOREIGN KEY ("id_funcion") REFERENCES "funciones"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservas" ADD CONSTRAINT "reservas_id_funcion_fkey" FOREIGN KEY ("id_funcion") REFERENCES "funciones"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservas" ADD CONSTRAINT "reservas_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reserva_asientos" ADD CONSTRAINT "reserva_asientos_id_asiento_funcion_fkey" FOREIGN KEY ("id_asiento_funcion") REFERENCES "asientos_funcion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reserva_asientos" ADD CONSTRAINT "reserva_asientos_id_reserva_fkey" FOREIGN KEY ("id_reserva") REFERENCES "reservas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pagos" ADD CONSTRAINT "pagos_id_reserva_fkey" FOREIGN KEY ("id_reserva") REFERENCES "reservas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reembolsos" ADD CONSTRAINT "reembolsos_id_pago_fkey" FOREIGN KEY ("id_pago") REFERENCES "pagos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "funciones" ADD CONSTRAINT "funciones_id_pelicula_fkey" FOREIGN KEY ("id_pelicula") REFERENCES "peliculas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "funciones" ADD CONSTRAINT "funciones_id_sala_fkey" FOREIGN KEY ("id_sala") REFERENCES "salas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "peliculas" ADD CONSTRAINT "peliculas_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_id_auditor_fkey" FOREIGN KEY ("id_auditor") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "password_reset_token" ADD CONSTRAINT "password_reset_token_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;
