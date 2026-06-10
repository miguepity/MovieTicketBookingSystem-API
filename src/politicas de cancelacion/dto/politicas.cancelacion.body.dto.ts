import { Decimal } from "@prisma/client/runtime/client";
import { IsNumber, IsDecimal, IsNotEmpty } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class PoliticasBodyDto{
    @ApiProperty({ example: 24, description: 'Horas mínimas antes de la función' })
    @IsNumber()
    @IsNotEmpty()
    horas_antes_minimo!: number

    @ApiProperty({ example: 48, description: 'Horas máximas antes de la función' })
    @IsNumber()
    horas_antes_maximo!: number

    @ApiProperty({ example: 50.00, description: 'Porcentaje de reembolso' })
    @IsDecimal()
    @IsNotEmpty()
    porcentaje_reembolso!: Decimal
}