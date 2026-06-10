import { IsString, IsDateString, IsOptional } from "class-validator"

export class FilterBodyDto{
    @IsOptional()
    @IsString()
    estado_pagos!: string

    @IsOptional()
    @IsString()
    estado_reembolsos!: string

    @IsOptional()
    @IsDateString()
    fecha_limite_pagos!: Date

    @IsOptional()
    @IsDateString()
    fecha_limite_reembolsos!: Date
}