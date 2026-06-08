import { Decimal } from "@prisma/client/runtime/client";
import { IsNumber, IsDecimal, IsNotEmpty } from "class-validator";

export class PoliticasBodyDto{
    @IsNumber()
    @IsNotEmpty()
    horas_antes_minimo!: number

    @IsNumber()
    horas_antes_maximo!: number

    @IsDecimal()
    @IsNotEmpty()
    porcentaje_reembolso!: Decimal
}