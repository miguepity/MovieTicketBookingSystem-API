import { IsString, IsDateString } from "class-validator"

export class FilterBodyDto{
    @IsString()
    estado!: string

    @IsDateString()
    created_at!: Date

    @IsDateString()
    fecha_procesado!: Date
}