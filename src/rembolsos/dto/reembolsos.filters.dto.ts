import { IsString, IsDateString } from "class-validator"

export class FilterBodyDto{
    @IsString()
    estado!: string

    @IsDateString()
    fecha_procesado!: Date
}