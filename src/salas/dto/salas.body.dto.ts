import { IsString, IsNotEmpty, IsNumber, Min } from "class-validator"
import { ApiProperty } from "@nestjs/swagger"

export class BodyDto{
    @ApiProperty({ example: 'Sala 1' })
    @IsString()
    @IsNotEmpty()
    nombre!: string

    @ApiProperty({ example: 1 })
    @IsNumber()
    @IsNotEmpty()
    id_cine!: number

    @ApiProperty({ example: 8, minimum: 1 })
    @IsNumber()
    @IsNotEmpty()
    @Min(1)
    filas!: number

    @ApiProperty({ example: 10, minimum: 1 })
    @IsNumber()
    @IsNotEmpty()
    @Min(1)
    columnas!: number
}