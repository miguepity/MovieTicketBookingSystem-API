import { IsString, IsNotEmpty, IsNumber } from "class-validator"

export class BodyDto{
    @IsString()
    @IsNotEmpty()
    nombre!: string

    @IsNumber()
    @IsNotEmpty()
    id_cine!: number

    @IsNumber()
    @IsNotEmpty()
    filas!: number

    @IsNumber()
    @IsNotEmpty()
    columnas!: number
}