import { IsDateString, IsString, IsNotEmpty, IsNumber } from "class-validator";

export class BodyDto{
    @IsString()
    @IsNotEmpty()
    nombre!: string

    @IsString()
    direccion!:  string 

    @IsNumber()
    @IsNotEmpty()
    id_ciudad!:  number
}