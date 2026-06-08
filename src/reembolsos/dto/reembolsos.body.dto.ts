import { Decimal } from "@prisma/client/runtime/client"
import { IsNumber, IsDecimal, IsString, IsNotEmpty, IsDateString } from "class-validator"

export class ReembolsosBodyDto{
    @IsNumber()
    @IsNotEmpty()
    id_pago!: number

    @IsDecimal()
    @IsNotEmpty()
    monto!: Decimal

    @IsString()
    @IsNotEmpty()
    estado!: string

    @IsDateString()
    fecha_procesado!: Date
}