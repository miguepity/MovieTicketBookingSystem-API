import { IsString, IsDateString, IsOptional } from "class-validator"
import { ApiPropertyOptional } from "@nestjs/swagger"

export class FilterBodyDto{
    @ApiPropertyOptional({ example: 'PENDIENTE' })
    @IsOptional()
    @IsString()
    estado_pagos!: string

    @ApiPropertyOptional({ example: 'COMPLETO' })
    @IsOptional()
    @IsString()
    estado_reembolsos!: string

    @ApiPropertyOptional({ example: '2026-06-10T12:00:00Z' })
    @IsOptional()
    @IsDateString()
    fecha_limite_pagos!: Date

    @ApiPropertyOptional({ example: '2026-06-10T12:00:00Z' })
    @IsOptional()
    @IsDateString()
    fecha_limite_reembolsos!: Date
}