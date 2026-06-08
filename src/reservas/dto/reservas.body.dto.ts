import { IsNumber, IsArray, IsString, IsNotEmpty, IsDateString, ArrayMinSize } from "class-validator"

export class ReservasBodyDto{
    @IsString({message: 'must be a string'})
    @IsNotEmpty({message: 'must not be empty'})
    numero_reserva!: string 
    
    @IsNumber({}, {message: 'must be a number'})
    @IsNotEmpty({message: 'must not be empty'})
    id_usuario!: number

    @IsNumber({}, {message: 'must be a number'})
    @IsNotEmpty({message: 'must not be empty'})
    id_funcion!: number

    @IsArray({message: 'must be an array'})
    @ArrayMinSize(1, {message: 'must be at least one in the array'})
    @IsNumber({}, {each: true, message: 'must be a number'})
    id_asientos!: number[]

    @IsString({message: 'must be a string'})
    @IsNotEmpty({message: 'must not be empty'})
    estado!: string 

    @IsDateString({}, {message: 'must be a date string'})
    updated_at!: Date 
}