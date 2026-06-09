import { IsNumber, IsArray, IsNotEmpty, ArrayMinSize } from "class-validator"
import { ApiProperty } from "@nestjs/swagger"

export class ReservasBodyDto{
    @ApiProperty({ example: 1 })
    @IsNumber({}, {message: 'must be a number'})
    @IsNotEmpty({message: 'must not be empty'})
    id_usuario!: number

    @ApiProperty({ example: 1 })
    @IsNumber({}, {message: 'must be a number'})
    @IsNotEmpty({message: 'must not be empty'})
    id_funcion!: number

    @ApiProperty({ example: [1, 2, 3] })
    @IsArray({message: 'must be an array'})
    @ArrayMinSize(1, {message: 'must be at least one in the array'})
    @IsNumber({}, {each: true, message: 'must be a number'})
    id_asientos!: number[]
}
