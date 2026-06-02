-- CreateTable
CREATE TABLE "cines" (
    "id" BIGSERIAL NOT NULL,
    "nombre" VARCHAR(150) NOT NULL,
    "direccion" VARCHAR(255),
    "id_ciudad" BIGINT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ciudades" (
    "id" BIGSERIAL NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ciudades_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "salas" (
    "id" BIGSERIAL NOT NULL,
    "nombre" VARCHAR(50) NOT NULL,
    "id_cine" BIGINT NOT NULL,
    "filas" INTEGER NOT NULL,
    "columnas" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "salas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "asientos" (
    "id" BIGSERIAL NOT NULL,
    "id_sala" BIGINT NOT NULL,
    "fila" CHAR(2) NOT NULL,
    "columna" INTEGER NOT NULL,
    "codigo" VARCHAR(10) NOT NULL,
    "tipo" VARCHAR(30) NOT NULL,

    CONSTRAINT "asientos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "asientos_funcion" (
    "id" BIGSERIAL NOT NULL,
    "id_asiento" BIGINT NOT NULL,
    "id_funcion" BIGINT NOT NULL,
    "estado" VARCHAR(20) NOT NULL,
    "id_usuario" BIGINT,
    "bloqueado_hasta" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "version" INTEGER NOT NULL,

    CONSTRAINT "asientos_funcion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reservas" (
    "id" BIGSERIAL NOT NULL,
    "numero_reserva" VARCHAR(20) NOT NULL,
    "id_usuario" BIGINT NOT NULL,
    "id_funcion" BIGINT NOT NULL,
    "estado" VARCHAR(30) NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "reservas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reserva_asientos" (
    "id" BIGSERIAL NOT NULL,
    "id_reserva" BIGINT NOT NULL,
    "id_asiento_funcion" BIGINT NOT NULL,

    CONSTRAINT "reserva_asientos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pagos" (
    "id" BIGSERIAL NOT NULL,
    "id_reserva" BIGINT NOT NULL,
    "id_cupon" BIGINT,
    "monto_original" DECIMAL(10,2) NOT NULL,
    "monto_descuento" DECIMAL(10,2) NOT NULL,
    "monto_final" DECIMAL(10,2) NOT NULL,
    "metodo" VARCHAR(20) NOT NULL,
    "estado" VARCHAR(20) NOT NULL,
    "referencia_externa" VARCHAR(255),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pagos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cupones" (
    "id" BIGSERIAL NOT NULL,
    "codigo" VARCHAR(50) NOT NULL,
    "tipo" VARCHAR(20) NOT NULL,
    "valor" DECIMAL(10,2) NOT NULL,
    "fecha_expiracion" DATE NOT NULL,
    "usos_maximos" INTEGER,
    "usos_actuales" INTEGER NOT NULL DEFAULT 0,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cupones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "politica_cancelacion" (
    "id" BIGSERIAL NOT NULL,
    "horas_antes_minimo" INTEGER NOT NULL,
    "horas_antes_maximo" INTEGER,
    "porcentaje_reembolso" DECIMAL(5,2) NOT NULL,

    CONSTRAINT "politica_cancelacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reembolsos" (
    "id" BIGSERIAL NOT NULL,
    "id_pago" BIGINT NOT NULL,
    "monto" DECIMAL(10,2) NOT NULL,
    "estado" VARCHAR(20) NOT NULL,
    "fecha_procesado" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reembolsos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "funciones" (
    "id" BIGSERIAL NOT NULL,
    "id_pelicula" BIGINT NOT NULL,
    "id_sala" BIGINT NOT NULL,
    "fecha_hora" TIMESTAMPTZ NOT NULL,
    "estado" VARCHAR(20) NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "funciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "peliculas" (
    "id" BIGSERIAL NOT NULL,
    "titulo" VARCHAR(200) NOT NULL,
    "sinopsis" TEXT,
    "poster_url" VARCHAR(500),
    "id_idioma" BIGINT,
    "id_genero" BIGINT,
    "fecha_estreno" DATE,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "id_usuario" BIGINT NOT NULL,

    CONSTRAINT "peliculas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roles" (
    "id" BIGSERIAL NOT NULL,
    "nombre" VARCHAR(30) NOT NULL,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usuarios" (
    "id" BIGSERIAL NOT NULL,
    "nombre" VARCHAR(150) NOT NULL,
    "email" VARCHAR(200) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "telefono" VARCHAR(20),
    "id_rol" BIGINT NOT NULL,
    "estado" VARCHAR(20) NOT NULL,
    "notificaciones_activas" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "idiomas" (
    "id" BIGSERIAL NOT NULL,
    "nombre" VARCHAR(60) NOT NULL,

    CONSTRAINT "idiomas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "generos" (
    "id" BIGSERIAL NOT NULL,
    "nombre" VARCHAR(60) NOT NULL,

    CONSTRAINT "generos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_log" (
    "id" BIGSERIAL NOT NULL,
    "id_usuario" BIGINT NOT NULL,
    "id_auditor" BIGINT NOT NULL,
    "accion" VARCHAR(100) NOT NULL,
    "detalle" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "password_reset_token" (
    "id" BIGSERIAL NOT NULL,
    "id_usuario" BIGINT NOT NULL,
    "token" VARCHAR(255) NOT NULL,
    "expires_at" TIMESTAMPTZ NOT NULL,
    "usado" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "password_reset_token_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ciudades_nombre_key" ON "ciudades"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "asientos_id_sala_fila_columna_key" ON "asientos"("id_sala", "fila", "columna");

-- CreateIndex
CREATE UNIQUE INDEX "reservas_numero_reserva_key" ON "reservas"("numero_reserva");

-- CreateIndex
CREATE UNIQUE INDEX "cupones_codigo_key" ON "cupones"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "roles_nombre_key" ON "roles"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE UNIQUE INDEX "idiomas_nombre_key" ON "idiomas"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "generos_nombre_key" ON "generos"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "password_reset_token_token_key" ON "password_reset_token"("token");

-- AddForeignKey
ALTER TABLE "cines" ADD CONSTRAINT "cines_id_ciudad_fkey" FOREIGN KEY ("id_ciudad") REFERENCES "ciudades"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "salas" ADD CONSTRAINT "salas_id_cine_fkey" FOREIGN KEY ("id_cine") REFERENCES "cines"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asientos" ADD CONSTRAINT "asientos_id_sala_fkey" FOREIGN KEY ("id_sala") REFERENCES "salas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asientos_funcion" ADD CONSTRAINT "asientos_funcion_id_asiento_fkey" FOREIGN KEY ("id_asiento") REFERENCES "asientos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asientos_funcion" ADD CONSTRAINT "asientos_funcion_id_funcion_fkey" FOREIGN KEY ("id_funcion") REFERENCES "funciones"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asientos_funcion" ADD CONSTRAINT "asientos_funcion_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservas" ADD CONSTRAINT "reservas_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservas" ADD CONSTRAINT "reservas_id_funcion_fkey" FOREIGN KEY ("id_funcion") REFERENCES "funciones"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reserva_asientos" ADD CONSTRAINT "reserva_asientos_id_reserva_fkey" FOREIGN KEY ("id_reserva") REFERENCES "reservas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reserva_asientos" ADD CONSTRAINT "reserva_asientos_id_asiento_funcion_fkey" FOREIGN KEY ("id_asiento_funcion") REFERENCES "asientos_funcion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pagos" ADD CONSTRAINT "pagos_id_reserva_fkey" FOREIGN KEY ("id_reserva") REFERENCES "reservas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pagos" ADD CONSTRAINT "pagos_id_cupon_fkey" FOREIGN KEY ("id_cupon") REFERENCES "cupones"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reembolsos" ADD CONSTRAINT "reembolsos_id_pago_fkey" FOREIGN KEY ("id_pago") REFERENCES "pagos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "funciones" ADD CONSTRAINT "funciones_id_pelicula_fkey" FOREIGN KEY ("id_pelicula") REFERENCES "peliculas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "funciones" ADD CONSTRAINT "funciones_id_sala_fkey" FOREIGN KEY ("id_sala") REFERENCES "salas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "peliculas" ADD CONSTRAINT "peliculas_id_idioma_fkey" FOREIGN KEY ("id_idioma") REFERENCES "idiomas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "peliculas" ADD CONSTRAINT "peliculas_id_genero_fkey" FOREIGN KEY ("id_genero") REFERENCES "generos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "peliculas" ADD CONSTRAINT "peliculas_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_id_rol_fkey" FOREIGN KEY ("id_rol") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_id_auditor_fkey" FOREIGN KEY ("id_auditor") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "password_reset_token" ADD CONSTRAINT "password_reset_token_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
